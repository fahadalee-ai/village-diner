import { business } from "@/data/business";
import { coupons, rewardCatalog } from "@/data/content";
import type { CartLine } from "./store";
import { money } from "./format";

export function lineTotal(line: CartLine) {
  return money(line.unitPrice * line.qty);
}

export function subtotalOf(cart: CartLine[]) {
  return money(cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0));
}

export function discountFor(subtotal: number, promoCode: string | null, rewardId: string | null) {
  if (rewardId) {
    const reward = rewardCatalog.find((r) => r.id === rewardId);
    if (!reward) return { amount: 0, label: "", blocked: "That reward is no longer available." };
    if (reward.minSubtotal && subtotal < reward.minSubtotal) {
      return { amount: 0, label: reward.name, blocked: `Available on orders of $${reward.minSubtotal.toFixed(2)} or more.` };
    }
    return { amount: Math.min(reward.discount, subtotal), label: reward.name, blocked: "" };
  }
  if (promoCode) {
    const coupon = coupons.find((c) => c.code === promoCode);
    if (!coupon) return { amount: 0, label: "", blocked: "" };
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return {
        amount: 0,
        label: coupon.title,
        blocked: `Available on orders of $${coupon.minSubtotal.toFixed(2)} or more.`,
      };
    }
    return { amount: Math.min(coupon.discount, subtotal), label: coupon.title, blocked: "" };
  }
  return { amount: 0, label: "", blocked: "" };
}

export function quote(input: {
  cart: CartLine[];
  promoCode: string | null;
  rewardId: string | null;
  tip: number;
  delivery: boolean;
}) {
  const subtotal = subtotalOf(input.cart);
  const discount = discountFor(subtotal, input.promoCode, input.rewardId);
  const taxable = money(Math.max(0, subtotal - discount.amount));
  const tax = money(taxable * business.taxRate);
  const fee = input.delivery ? business.deliveryFee : 0;
  const total = money(taxable + tax + input.tip + fee);
  return { subtotal, discount, tax, fee, tip: input.tip, total };
}
