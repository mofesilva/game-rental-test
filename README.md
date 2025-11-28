This is the validation app for the Cappuccino videogame rental tenant built with the [Next.js App Router](https://nextjs.org/docs/app).

## Environment setup

- The tenant base URL and API key are committed in `src/lib/cappuccino/tenant-config.ts` so the project runs right after cloning.
- `.env.example` is optional and only needed if you want to override the defaults locally; any value set there takes precedence.

`resolveCappuccinoConfig()` (see `src/lib/cappuccino/config.ts`) merges the optional env overrides with the committed tenant config and fails fast if anything is empty.

## Available scripts

```bash
npm run dev    # start Next.js locally
npm run build  # create a production build
npm run start  # run the production build
npm run lint   # run eslint
```

## Cappuccino bootstrap

The shared client lives in `src/lib/cappuccino/client.ts` and is fed by the deterministic resolver described above. All feature work (auth, uploads, collections, rentals) builds on top of this instance.
