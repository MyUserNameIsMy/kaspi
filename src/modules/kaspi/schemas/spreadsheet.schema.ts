export const spreadsheetSchema = {
  'PRODUCT NAME': {
    prop: 'name',
  },
  PRICE: {
    prop: 'price',
  },
};

export const writeFileSchema = [
  {
    column: 'Product search name',
    type: String,
    value: (product) => product.search_name,
  },
  {
    column: 'Product kaspi name',
    type: String,
    value: (product) => product.kaspi_name,
  },
  {
    column: 'Kaspi price',
    type: Number,
    value: (product) => product.kaspi_price,
  },
  {
    column: 'Kaspi id',
    type: String,
    value: (product) => product.kaspi_id,
  },
  {
    column: 'Kaspi link',
    type: String,
    value: (product) => product.kaspi_link,
  },
  {
    column: 'Маржинальность в процентах',
    type: Number,
    value: (product) => product.margin_percent,
  },
  {
    column: 'Маржинальность в тенге',
    type: Number,
    value: (product) => product.margin_kzt,
  },
];
