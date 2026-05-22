# Geographic Pricing - Quick Reference

## ✅ Implementation Status

**All code changes complete!** Environment variables added to Vercel Production.

---

## 📊 Pricing Structure

| Service | India (INR) | International (USD) | Revenue Multiplier |
|---------|-------------|---------------------|-------------------|
| AI Review | ₹99 (~$1.19) | $4.99 | **4.2x** |
| Rewrite Add-on | ₹499 (~$5.99) | $19.99 | **3.3x** |

---

## 🔧 Environment Variables

### Added to Vercel Production ✅

```env
# India Products (Test Mode)
DODO_TEST_REVIEW_PRODUCT_ID_IN=pdt_0NfFG7jxMOcx93RjX2ZlE
DODO_TEST_REWRITE_PRODUCT_ID_IN=pdt_0NfFGDjD3jhJqmLSazHsp

# US Products (Test Mode)
DODO_TEST_REVIEW_PRODUCT_ID_US=pdt_0NfNo1dQGVehlJNZJxXT7
DODO_TEST_REWRITE_PRODUCT_ID_US=pdt_0NfNnxQLYfmsQEBUmM0kv

# Pricing (Public)
NEXT_PUBLIC_DODO_REVIEW_PRICE_IN=99
NEXT_PUBLIC_DODO_REWRITE_PRICE_IN=499
NEXT_PUBLIC_DODO_REVIEW_PRICE_US=4.99
NEXT_PUBLIC_DODO_REWRITE_PRICE_US=19.99
```

### ⚠️ Still Needed (Live Mode)

```env
# Create these in Dodo Dashboard first, then add to Vercel:
DODO_LIVE_REVIEW_PRODUCT_ID_US=(pending)
DODO_LIVE_REWRITE_PRODUCT_ID_US=(pending)
```

---

## 🚀 How It Works

1. **User visits site** → IP detected via `ipapi.co`
2. **Indian IP** (country_code = 'IN'):
   - Shows ₹99/₹499
   - Uses `_IN` product IDs
3. **International IP** (all other countries):
   - Shows $4.99/$19.99
   - Uses `_US` product IDs
4. **Checkout** → Dodo processes payment in appropriate currency
5. **Webhook** → Stores `customer_region` for analytics

---

## 🧪 Testing

### Test from India:
```bash
# Use VPN or actual Indian IP
# Should see: ₹99 for review
```

### Test from US:
```bash
# Use US VPN or actual US IP  
# Should see: $4.99 for review
```

### Test locally:
```bash
npm run dev
# Default: US pricing ($4.99)
# To simulate India: Change fallback in lib/utils/region.ts
```

---

## 📁 Files Modified

1. **Environment**: `.env.local`
2. **Utilities**: `lib/utils/region.ts` (NEW)
3. **API Routes**:
   - `app/api/checkout/create/route.ts`
   - `app/api/checkout/rewrite/route.ts`
4. **Frontend**:
   - `app/dashboard/new-review/page.tsx`
   - `app/dashboard/new-review/PaymentModal.tsx`
   - `app/dashboard/review/[id]/rewrite/page.tsx`
   - `app/dashboard/review/[id]/rewrite/RewritePaymentModal.tsx`
5. **Documentation**: `LinkedIn_Reviewer_PRD.md`

---

## ⚡ Next Steps

### 1. Create Live Mode US Products (Dodo Dashboard)
```
Product Name: linkedin-ai-review-us
Price: $4.99 USD

Product Name: linkedin-rewrite-us  
Price: $19.99 USD
```

### 2. Add Live Mode Product IDs to Vercel
```bash
vercel env add DODO_LIVE_REVIEW_PRODUCT_ID_US production --value "pdt_xxxxxxxx" --yes
vercel env add DODO_LIVE_REWRITE_PRODUCT_ID_US production --value "pdt_yyyyyyyy" --yes
```

### 3. Deploy to Production
```bash
git add .
git commit -m "feat: implement geographic pricing with region-based USD/INR rates"
git push
vercel --prod
```

### 4. Test Live Flow
- Test payment from Indian IP → Should charge ₹99
- Test payment from US IP → Should charge $4.99

---

## 🛡️ Fallback Behavior

If IP detection fails:
- Defaults to **US pricing** ($4.99/$19.99)
- Falls back to browser locale detection
- If locale contains 'IN' or 'hi' → India pricing

**Rationale**: Defaulting to higher price maximizes revenue from unknown regions.

---

## 📈 Analytics Tracking

Every payment includes `customer_region` in metadata:
- Track conversion rates by region
- Monitor revenue split (IN vs US)
- Optimize pricing based on data

Query in InsForge:
```sql
SELECT 
  metadata->>'customer_region' as region,
  COUNT(*) as total_payments,
  SUM(payment_amount) as total_revenue
FROM reviews
WHERE payment_status = 'paid'
GROUP BY region;
```

---

## 🔒 Security Notes

- IP detection is client-side only (not foolproof)
- Users can spoof location with VPN
- Consider server-side IP verification for production
- Monitor for abuse patterns (e.g., VPN usage spikes)

---

## 💡 Future Enhancements

1. **Multi-tier pricing**: Add EU/UK, Southeast Asia tiers
2. **Currency selector**: Let users self-select region (honour system)
3. **Server-side IP validation**: Prevent VPN abuse
4. **Dynamic pricing**: Adjust based on exchange rates
5. **Landing page pricing**: Show dual pricing or detect region early

---

**Questions?** Check `lib/utils/region.ts` for detection logic or review the Dodo product configuration in your dashboard.
