# `@fe/ui`

Shared React UI primitives for Arvilio apps (Campus, Control Plane, …).

## Layout

```
src/
  button/           Button
  field/            Field
  advanced-select/  AdvancedSelectControl + options helpers
  date-picker/      DatePickerControl
  time-picker/      TimePickerControl
  picker/           BodyPortal, PickerPopover, picker.module.scss
  lib/              breakpoints, tel-mask, date utils, …
  hooks/
  styles/           primitives.module.scss (button/field shared)
  index.ts
```

## Usage

```ts
import { Button, Field } from '@fe/ui';
```

Apps must list `@fe/ui` in `transpilePackages` (Next.js) and provide design tokens on `:root` / `[data-theme]`.
