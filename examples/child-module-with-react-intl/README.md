# Child Module With [React Intl][]

This example child module shows how to integrate [React Intl][] into your module.

## How to use

### Using `create-one-app-module`

```bash
npx create-one-app-module --example child-module-with-react-intl child-module-with-react-intl
# or
yarn create one-app-module --example child-module-with-react-intl child-module-with-react-intl
```

## Add `react-intl` as a `requiredExternal`

To minimize bundle size, you should add `react-intl` as a [requiredExternal](https://github.com/americanexpress/one-app-cli/tree/main/packages/one-app-bundler#providedexternals--requiredexternals). You will also need to add `react-intl` as a `providedExternal` in your root module.

[react intl]: https://formatjs.io/docs/react-intl/
