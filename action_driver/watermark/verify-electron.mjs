import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
const here=fileURLToPath(new URL('./',import.meta.url))
const root=path.resolve(here,'../../../..')
const { _electron }=createRequire(import.meta.url)(path.join(root,'thridparty/playwright/packages/playwright-core'))
const executablePath=process.argv[2] ?? path.join(root,'thridparty/build/electron-workspace/src/out/ActionDriver/Electron.app/Contents/MacOS/Electron')
const output=path.join(root,'thridparty/build/verification/watermark')
await mkdir(output,{recursive:true})
const temporary=await mkdtemp(path.join(tmpdir(),'watermark-electron-'))
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS
const app=await _electron.launch({executablePath,args:[path.join(here,'electron-app'),`--user-data-dir=${temporary}`],env,timeout:30000})
try {
  const page=await app.firstWindow()
  await page.getByRole('button',{name:'Click verification'}).click()
  assert.equal(await page.locator('#result').textContent(),'1')
  await page.getByLabel('Input verification').fill('native overlay allows input')
  assert.equal(await page.getByLabel('Input verification').inputValue(),'native overlay allows input')
  await page.locator('.scroll').hover();await page.mouse.wheel(0,400)
  await page.waitForFunction(()=>document.querySelector('.scroll').scrollTop>0)
  const nativeId=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getMediaSourceId())
  const windowId=nativeId.split(':')[1]
  const capture=async name=>{
    await page.waitForTimeout(350)
    execFileSync('/usr/sbin/screencapture',['-x','-o',`-l${windowId}`,path.join(output,name+'.png')],{stdio:'pipe'})
    assert.ok((await readFile(path.join(output,name+'.png'))).length>1000)
  }
  await capture('light')
  await app.evaluate(({nativeTheme})=>{nativeTheme.themeSource='dark'})
  await page.evaluate(()=>{document.body.style.background='#161616';document.body.style.color='#eee'})
  await capture('dark')
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1100,800))
  await capture('resized')
  await page.reload()
  await page.getByRole('button',{name:'Click verification'}).click()
  assert.equal(await page.locator('#result').textContent(),'1')
  assert.equal(await page.locator('body').textContent().then(text=>text.includes('action-driver-dev')),false)
  await app.evaluate(({BrowserWindow,View})=>{
    const window=BrowserWindow.getAllWindows()[0]
    const original=window.contentView
    window.setContentView(new View())
    window.setContentView(original)
  })
  await page.getByLabel('Input verification').fill('content replaced and restored')
  await capture('content-restored')
  await app.evaluate(({BrowserWindow})=>new Promise((resolve,reject)=>{
    const window=BrowserWindow.getAllWindows()[0]
    const timer=setTimeout(()=>reject(new Error('FULLSCREEN_TIMEOUT')),15000)
    window.once('enter-full-screen',()=>{clearTimeout(timer);resolve()})
    window.setFullScreen(true)
  }))
  await capture('fullscreen')
  await app.evaluate(({BrowserWindow})=>new Promise((resolve,reject)=>{
    const window=BrowserWindow.getAllWindows()[0]
    const timer=setTimeout(()=>reject(new Error('FULLSCREEN_TIMEOUT')),15000)
    window.once('leave-full-screen',()=>{clearTimeout(timer);resolve()})
    window.setFullScreen(false)
  }))
  const versions=await app.evaluate(()=>({electron:process.versions.electron,chrome:process.versions.chrome,arch:process.arch,executablePath:process.execPath}))
  assert.equal(versions.electron,'38.8.6')
  assert.equal(versions.arch,'arm64')
  await writeFile(path.join(output,'result.json'),JSON.stringify({versions,click:true,input:true,scroll:true,navigation:true,contentReplacement:true,fullscreen:true,screenshots:'OS native window captures; inspect visually'},null,2)+'\n')
  console.log('WATERMARK_ELECTRON_INTERACTION_PASS',output)
} finally {await app.close();await rm(temporary,{recursive:true,force:true})}
