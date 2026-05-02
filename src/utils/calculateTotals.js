export const calculateOrderTotals = (cartItems) =>{
        let totalItems = 0;
        let productCostCents = 0;
        let maxShippingFeeCents = 0;

        for(const item of cartItems) {
            totalItems += item.quantity;
            productCostCents += item.product.priceCents * item.quantity;
            //set a max shipping fee if order less than 39.99
            if(item.deliveryOption.priceCents > maxShippingFeeCents){
                maxShippingFeeCents = item.deliveryOption.priceCents;
            }
        };

        let finalShippingCostCents = maxShippingFeeCents;
        if(productCostCents >= 3999){
            finalShippingCostCents = 0;
        };

        const totalCostBeforeTaxCents = productCostCents+finalShippingCostCents;
        const taxCents = Math.round(totalCostBeforeTaxCents*0.10);
        const totalCostCents = totalCostBeforeTaxCents + taxCents;

        return {
            totalItems,
            productCostCents,
            shippingCostCents: finalShippingCostCents,
            totalCostBeforeTaxCents,
            taxCents,
            totalCostCents
        };
};