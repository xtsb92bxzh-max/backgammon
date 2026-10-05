import{test}from'node:test';import assert from'node:assert/strict';import{initialBoard,moves,apply,turns,exercises}from'./engine.js';
test('starting checkers and pip counts',()=>{const b=initialBoard();assert.equal(b.p.filter(v=>v>0).reduce((a,v)=>a+v,0),15);assert.equal(b.p.reduce((s,v,i)=>s+(v>0?v*i:0),0),167)});
test('recommended openings are legal complete turns',()=>{for(const e of exercises){assert.ok(turns(initialBoard(),e.dice).some(path=>JSON.stringify(path)===JSON.stringify(e.best)));assert.equal(e.best.reduce(apply,initialBoard()).p[e.best[0].to],2)}});
test('closed points block moves and blots are hit',()=>{const b=initialBoard();b.p[21]=-2;assert.ok(!moves(b,3).some(m=>m.from===24));b.p[21]=-1;const c=apply(b,{from:24,to:21,die:3});assert.equal(c.p[21],1);assert.equal(c.enemyBar,1)});
test('bar checkers enter first',()=>{const b=initialBoard();b.bar=1;assert.ok(moves(b,3).every(m=>m.from===25))});
test('bearing off requires all checkers home and oversized dice cannot skip higher checkers',()=>{const b=initialBoard();assert.ok(!moves(b,6).some(m=>m.to===0));b.p=Array(25).fill(0);b.p[4]=1;b.p[6]=1;assert.ok(!moves(b,5).some(m=>m.from===4));b.p[6]=0;assert.ok(moves(b,5).some(m=>m.from===4&&m.to===0))});
test('doubles provide four moves',()=>{assert.ok(turns(initialBoard(),[2,2,2,2]).every(t=>t.length===4))});
test('higher die is required if only one can be used',()=>{const b=initialBoard();b.p=Array(25).fill(0);b.p[1]=1;assert.equal(turns(b,[1,2])[0][0].die,2)});
