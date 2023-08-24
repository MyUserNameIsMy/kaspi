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
    column: 'Наименование продукта при поиске',
    type: String,
    value: (product) => product.search_name,
  },
  {
    column: 'Наименование продукта в каспи',
    type: String,
    value: (product) => product.kaspi_name,
  },
  {
    column: 'Цена поставщика',
    type: Number,
    value: (product) => product.price,
  },
  {
    column: 'Цена в каспи',
    type: Number,
    value: (product) => product.kaspi_price,
  },
  {
    column: 'Каспи Код',
    type: String,
    value: (product) => product.kaspi_id,
  },
  {
    column: 'Каспи ссылка',
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

  {
    column: 'Рейтинг',
    type: Number,
    value: (product) => product.rating,
  },

  {
    column: 'Количество отзывов',
    type: Number,
    value: (product) => product.review_count,
  },

  {
    column: 'Количество продавцов',
    type: Number,
    value: (product) => product.merchants_count,
  },
];
