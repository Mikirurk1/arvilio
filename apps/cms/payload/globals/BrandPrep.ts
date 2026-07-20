import type { GlobalConfig } from 'payload';

/** Minimal global so a brand admin group appears before real collections exist. */
function brandPrepGlobal(opts: {
  slug: string;
  group: string;
  label: string;
  productName: string;
}): GlobalConfig {
  return {
    slug: opts.slug,
    label: opts.label,
    admin: {
      group: opts.group,
      description: `Placeholder until ${opts.productName} content ships. Add Nav / Content / Global here later.`,
    },
    access: {
      read: () => true,
      update: ({ req: { user } }) => Boolean(user),
    },
    fields: [
      {
        name: 'notes',
        type: 'textarea',
        defaultValue: `${opts.productName} CMS area — reserved. Do not put Campus or Hub marketing content here.`,
        admin: {
          description: 'Internal reminder for editors. Safe to replace when real fields arrive.',
        },
      },
      {
        name: 'ready',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'Flip when this product’s CMS surface is live',
        },
      },
    ],
  };
}

/** Preparatory Connect brand group (Phase E+). Hub already has real collections. */
export const ConnectPrep = brandPrepGlobal({
  slug: 'connect-prep',
  group: 'Connect',
  label: 'Overview',
  productName: 'Connect',
});
