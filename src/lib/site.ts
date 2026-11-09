/** Dados editáveis da empresa. Troque os valores marcados com TODO quando o cliente enviar. */
export const site = {
  name: "Sicla Equipamentos",
  tagline: "Caldeiraria de alta qualidade",
  // TODO: número real do WhatsApp (somente dígitos, com DDI+DDD). Ex.: 5547999999999
  whatsapp: "5500000000000",
  // TODO: e-mail comercial real
  email: "contato@siclaequipamentos.com.br",
  // TODO: cidade / endereço real
  city: "Brasil",
};

export const whatsappLink = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
