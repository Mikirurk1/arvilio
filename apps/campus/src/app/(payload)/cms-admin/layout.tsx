import type { ServerFunctionClient } from 'payload'
import { initI18n } from '@payloadcms/translations'
import { ProgressBar, RootProvider } from '@payloadcms/ui'
import type { Theme } from '@payloadcms/ui/providers/Theme'
import { getClientConfig } from '@payloadcms/ui/utilities/getClientConfig'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { applyLocaleFiltering } from 'payload/shared'
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from 'payload'
import { headers as getHeaders } from 'next/headers'
import React from 'react'
import config from '../../../../payload.config'
import { importMap } from './importMap.js'

import '@payloadcms/next/css'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default async function Layout({ children }: Args) {
  const headers = await getHeaders()
  const cookies = parseCookies(headers)

  const resolvedConfig = await config
  const payload = await getPayload({ config, importMap })

  const languageCode = getRequestLanguage({ config: resolvedConfig, cookies, headers })
  const i18n = await initI18n({
    config: resolvedConfig.i18n,
    context: 'client',
    language: languageCode,
  })

  const { user } = await executeAuthStrategies({ headers, payload })

  const themeCookie = cookies.get('payload-theme') as Theme | undefined
  const theme: Theme = themeCookie === 'light' || themeCookie === 'dark' ? themeCookie : 'dark'

  const req = await createLocalReq(
    {
      req: {
        headers,
        host: headers.get('host') ?? undefined,
        i18n,
        user,
      },
    },
    payload,
  )

  const permissions = await getAccessResults({ req })

  const clientConfig = getClientConfig({
    config: resolvedConfig,
    i18n,
    importMap,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: (req.user ?? undefined) as any,
  })

  await applyLocaleFiltering({ clientConfig, config: resolvedConfig, req })

  return (
    <>
      {/* Sync theme before paint — theme is server-validated 'dark'|'light', no XSS risk */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme','${theme}')`,
        }}
      />
      <RootProvider
        config={clientConfig}
        dateFNSKey={i18n.dateFNSKey}
        fallbackLang={resolvedConfig.i18n.fallbackLanguage}
        isNavOpen
        languageCode={languageCode}
        languageOptions={[]}
        locale={undefined}
        permissions={permissions}
        serverFunction={serverFunction}
        theme={theme}
        translations={i18n.translations}
        user={req.user ?? null}
      >
        <ProgressBar />
        {children}
        <div id="portal" />
      </RootProvider>
    </>
  )
}
