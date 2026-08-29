import { PromoCode } from '../business-objects/PromoCode';

export interface ApplyPromoCodeResult {
  promoCode: PromoCode;
  discountAmount: number;
}

export function applyPromoCodeUseCase(code: string, total: number): ApplyPromoCodeResult {
  const promo = PromoCode.findByCode(code);

  if (!promo || promo.isExpired() || promo.isLimitReached()) {
    throw new Error('Code cannot be applied');
  }

  return {
    promoCode: promo,
    discountAmount: promo.calcDiscount(total),
  };
}
