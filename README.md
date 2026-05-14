# ML Scout 🔍

Ferramenta de inteligência de mercado para o **Mercado Livre Brasil**.

## Funcionalidades

- **Mais vendidos** — busca por palavra-chave, ordenado por quantidade vendida
- **Espionar concorrente** — cola o ID ou URL de qualquer anúncio e vê todos os dados (preço, vendas, estoque, atributos, dados do vendedor)
- **Tendências** — lista os termos mais buscados agora no ML Brasil (clique para pesquisar)

## Tecnologia

- React 18 + Vite
- API pública do Mercado Livre (sem autenticação necessária para consultas)
- Zero dependências externas além do React

---

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Build para produção
npm run build
```

---

## Deploy no Vercel

1. Suba este repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório
4. Framework: **Vite** (detectado automaticamente)
5. Clique em **Deploy** — pronto!

## Deploy no Netlify

1. Suba no GitHub
2. [netlify.com](https://netlify.com) → **Add new site** → Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

---

## Próximos passos sugeridos

- [ ] Exportar resultados para CSV/Excel
- [ ] Comparar múltiplos concorrentes lado a lado
- [ ] Histórico de preços (requer auth na API do ML)
- [ ] Integração com Make para automação de anúncios
- [ ] Alertas de preço via Telegram

---

## API do Mercado Livre usada

| Endpoint | Uso |
|---|---|
| `/sites/MLB/search?q=...&sort=sold_quantity` | Busca mais vendidos |
| `/items/{id}` | Dados completos do anúncio |
| `/users/{id}` | Dados do vendedor |
| `/trends/MLB` | Tendências de busca |
