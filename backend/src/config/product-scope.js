const PRODUCT_CATEGORIES = Object.freeze(["Food & Beverage", "Spices & Seasonings"]);
const productScope = () => ({category: {in: [...PRODUCT_CATEGORIES]}});
module.exports = {PRODUCT_CATEGORIES, productScope};
