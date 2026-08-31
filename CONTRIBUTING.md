# Panduan Kontribusi

## Cara berkontribusi

1. **Fork** repo ini
2. Buat branch: `feat/nama-fitur`, `fix/nama-bug`, `docs/perubahan`
3. Commit dengan [Conventional Commits](https://conventionalcommits.org): `feat:`, `fix:`, `docs:`
4. Buka Pull Request — jelaskan apa dan mengapa

## Dev

```bash
npm install
npm run dev      # dev server
npm test         # unit tests
npm run lint     # ESLint
npm run build    # production build
```

## Jangan commit

- File `.env*` (kecuali `.env.example`)
- API key, token, atau credential
- Folder `.agents/`, `.lovable/`, `.gemini/`

## Lisensi

Kontribusimu dilisensikan di bawah [MIT License](LICENSE).
