// Run with EVENT_INVITE set privately and playwright-core available to Node.
// Never commit an invitation URL, decrypted score, or stanza text.
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.goto(process.env.EVENT_INVITE);
  for(const [i,stanzas] of [2,4,3,1].entries()){
   await page.locator('#contents button').nth(i).click();
   await page.locator('[data-mode="score"]').click();
   assert.equal(await page.locator('figure img').count(),[2,1,2,1][i]);
   await page.locator('figure img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
   assert.equal(await page.locator('#content .verse,#content .pdf').count(),0);
   await page.locator('[data-mode="lyrics"]').click();
   assert.equal(await page.locator('.verse p').count(),stanzas);
   assert.equal(await page.locator('figure,.pdf').count(),0);
  }
  await page.locator('[data-mode="print"]').click();
  assert.equal(await page.locator('.pdf').count(),4);
  assert.equal(await page.locator('figure,.verse').count(),0);
  console.log('All four hymns keep score, lyrics and printable content separate.');
 }finally{await browser.close()}
})().catch(()=>{console.error('Event view regression failed; check the invitation and browser locally.');process.exit(1)});
