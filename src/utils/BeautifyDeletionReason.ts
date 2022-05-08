const reasons = [
  { raw: "осмысленные вопросы", beautified: "Спам" },
  { raw: "контрольных", beautified: "К/р" },
  { raw: "рекламной информации", beautified: "Реклама" },
  { raw: "ссылок на сторонние", beautified: "Ссылка" },
  { raw: "не связан с тематикой", beautified: "Не школа" },
  { raw: "ответом на заданный вопрос", beautified: "Спам" },
  { raw: "ответ скопирован", beautified: "Копия" },
  { raw: "на другие сайты", beautified: "Ссылка" },
  { raw: "комментарий не является", beautified: "Не ответ" },
  { raw: "реклама в вопросах", beautified: "Реклама" },
  { raw: "ненормативная лексика", beautified: "Оскорбление" },
  { raw: "в грубой форме", beautified: "Культура" },
  { raw: "", beautified: "Пред." }
];

export default (text: string) => {
  for (const entry of reasons) {
    if (text.includes(entry.raw)) return entry.beautified;
  }
};