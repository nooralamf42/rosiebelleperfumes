"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertAdmin } from "@/lib/admin-guard";
import { productSchema, type ProductInput } from "@/lib/validators";
import { deleteProductImages } from "@/lib/cloudinary-delete";
import { allProductImages, parseSizeImages } from "@/lib/product-images";
import { cancelShipping, fulfillOrder, markOrderDelivered, markOrderShipped, type ManualShipInput } from "@/lib/orders";
import { refundOrder, RefundError } from "@/lib/refunds";
import { isEmailEnabled, sendOrderEmail, type OrderEmailKind } from "@/lib/email";
import { ORDER_EMAIL_KINDS } from "@/lib/email/order-email";

type ActionResult = { ok: boolean; error?: string; id?: string };

export async function saveProduct(
  input: ProductInput & { id?: string },
): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) {
      return { ok: false, error: "Connect a database to save products." };
    }
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    const d = parsed.data;

    // Resolve category: create a new one when a name is supplied, else use the id.
    let categoryId = d.categoryId ?? null;
    if (d.newCategory && d.newCategory.trim()) {
      const name = d.newCategory.trim();
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      const cat = await db.category.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      categoryId = cat.id;
    }

    const data = {
      name: d.name,
      slug: d.slug,
      tagline: d.tagline || null,
      description: d.description,
      type: d.type,
      price: d.price,
      compareAtPrice: d.compareAtPrice ?? null,
      images: d.images,
      // Only pictures for sizes the product still has.
      sizeImages: Object.fromEntries(
        Object.entries(d.sizeImages).filter(([label, list]) => list.length > 0 && d.sizes.some((s) => s.split("=")[0].trim() === label)),
      ),
      accentColor: d.accentColor,
      flavor: d.flavor || null,
      mood: d.mood || null,
      sizes: d.sizes,
      benefits: d.benefits,
      ingredients: d.ingredients || null,
      stock: d.stock,
      featured: d.featured,
      isActive: d.isActive,
      categoryId,
    };

    let id = input.id;
    let before: string[] = [];
    if (id) {
      const old = await db.product.findUnique({ where: { id }, select: { images: true, sizeImages: true } });
      before = old ? allProductImages({ images: old.images, sizeImages: parseSizeImages(old.sizeImages) }) : [];
      await db.product.update({ where: { id }, data });
    } else {
      const created = await db.product.create({ data });
      id = created.id;
    }

    // A picture that was replaced or removed is deleted from Cloudinary now that the new set is saved.
    const kept = new Set(allProductImages({ images: data.images, sizeImages: data.sizeImages as Record<string, string[]> }));
    await deleteProductImages(before.filter((url) => !kept.has(url)));

    // Expire cached catalog data (incl. the old slug if it changed), then the
    // pages; "layout" also refreshes nav categories rendered by the root layout.
    updateTag(CACHE_TAGS.catalog);
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) return { ok: false, error: "Database not configured" };
    const old = await db.product.findUnique({ where: { id }, select: { images: true, sizeImages: true } });
    await db.product.delete({ where: { id } });
    if (old) await deleteProductImages(allProductImages({ images: old.images, sizeImages: parseSizeImages(old.sizeImages) }));
    updateTag(CACHE_TAGS.catalog);
    revalidatePath("/admin/products");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete" };
  }
}

/**
 * Delete a picture that was uploaded in the editor but never saved (replaced or
 * removed again before pressing Save). Saved pictures are cleaned up when the
 * product is saved instead.
 */
export async function discardUploadedImageAction(url: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    const inUse = hasDatabase ? await db.product.count({ where: { images: { has: url } } }) : 0;
    if (inUse === 0) await deleteProductImages([url]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't delete the picture" };
  }
}

/** Admin-side cancel for orders that never got paid. */
export async function adminCancelOrderAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!hasDatabase) return { ok: false, error: "Database not configured" };
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status !== "PENDING") {
      return { ok: false, error: "Only unpaid orders can be cancelled here." };
    }
    await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to cancel" };
  }
}

export async function fulfillOrderAction(
  orderId: string,
): Promise<ActionResult & { warning?: string; labelUrl?: string | null }> {
  try {
    await assertAdmin();
    const result = await fulfillOrder(orderId);
    revalidatePath("/admin/orders");
    return {
      ok: true,
      warning: result.warning,
      labelUrl: "labelUrl" in result ? result.labelUrl : undefined,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to fulfill" };
  }
}

/** Cancel a booked (not yet picked up) Shiprocket shipment; the order returns to "confirmed". */
export async function cancelShippingAction(orderId: string): Promise<ActionResult & { warning?: string }> {
  try {
    await assertAdmin();
    const { warning } = await cancelShipping(orderId);
    revalidatePath("/admin/orders");
    return { ok: true, warning };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't cancel the shipping" };
  }
}

/** Refund part or all of an order's payment (amount in paise). */
export async function refundOrderAction(
  orderId: string,
  amount: number,
): Promise<ActionResult & { warning?: string; cancelled?: boolean; refunded?: number }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can refund orders." };
  }
  try {
    const result = await refundOrder(orderId, amount);
    revalidatePath("/admin/orders");
    return { ok: true, warning: result.warning, cancelled: result.cancelled, refunded: result.amount };
  } catch (err) {
    if (err instanceof RefundError) return { ok: false, error: err.message };
    console.error("refundOrderAction failed", err);
    return { ok: false, error: "Refund failed. Check the Razorpay dashboard before trying again." };
  }
}

/** Send (or re-send) an order email to the customer now. */
export async function sendOrderEmailAction(
  orderId: string,
  kind: OrderEmailKind,
): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can send emails." };
  }
  if (!ORDER_EMAIL_KINDS.includes(kind)) return { ok: false, error: "Unknown email." };
  if (!(await isEmailEnabled())) {
    return { ok: false, error: "Email isn't set up yet: add your Resend API key in Settings > Integrations." };
  }
  try {
    await sendOrderEmail(orderId, kind, { manual: true });
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    revalidatePath("/admin/orders");
    return { ok: false, error: err instanceof Error ? err.message : "Email failed" };
  }
}

/** Shipping without Shiprocket: mark a confirmed order as shipped (courier/tracking optional). */
export async function markShippedAction(orderId: string, input: ManualShipInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    await markOrderShipped(orderId, input);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't mark as shipped" };
  }
}

export async function markDeliveredAction(orderId: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await markOrderDelivered(orderId);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Couldn't mark as delivered" };
  }
}
