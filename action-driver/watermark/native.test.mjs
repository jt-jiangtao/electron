import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
for (const [name, defines] of [
  ['development default on', ['-DACTION_DRIVER=1', '-DACTION_DRIVER_DEVELOPMENT=1']],
  ['other own build flag only', ['-DACTION_DRIVER=1']],
  ['macro off', []]
]) test(name, t => {
  const directory=mkdtempSync(path.join(tmpdir(),'watermark-policy-'))
  t.after(()=>rmSync(directory,{recursive:true,force:true}))
  const output=path.join(directory,'policy')
  execFileSync('/usr/bin/clang++',['-std=c++20','-I',root,...defines,path.join(root,'action-driver/watermark/policy-test.cc'),'-o',output],{stdio:'pipe'})
  execFileSync(output,[],{stdio:'pipe'})
})
test('AppKit view stays transparent to interaction and follows native window layout', t => {
  const directory=mkdtempSync(path.join(tmpdir(),'watermark-native-'))
  t.after(()=>rmSync(directory,{recursive:true,force:true}))
  const output=path.join(directory,'native')
  execFileSync('/usr/bin/clang++',['-std=c++20','-fobjc-arc','-isysroot','/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk','-DACTION_DRIVER=1','-I',root,'-framework','Cocoa',path.join(root,'action-driver/watermark/native-test.mm'),path.join(root,'shell/browser/ui/cocoa/action-driver/watermark_view.mm'),'-o',output],{stdio:'pipe'})
  const result=execFileSync(output,[],{encoding:'utf8'})
  assert.match(result,/NATIVE_WATERMARK_PASS/)
})
