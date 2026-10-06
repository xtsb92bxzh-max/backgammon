import{test}from'node:test';import assert from'node:assert/strict';import{initialBoard,moves,apply,turns,exercises}from'./engine.js';
test('starting checkers and pip counts',()=>{const b=initialBoard();assert.equal(b.p.filter(v=>v>0).reduce((a,v)=>a+v,0),15);assert.equal(b.p.reduce((s,v,i)=>s+(v>0?v*i:0),0),167)});
test('recommended openings are legal complete turns',()=>{for(const e of exercises){assert.ok(turns(initialBoard(),e.dice).some(path=>JSON.stringify(path)===JSON.stringify(e.best)));assert.equal(e.best.reduce(apply,initialBoard()).p[e.best[0].to],2)}});
test('closed points block moves and blots are hit',()=>{const b=initialBoard();b.p[21]=-2;assert.ok(!moves(b,3).some(m=>m.from===24));b.p[21]=-1;const c=apply(b,{from:24,to:21,die:3});assert.equal(c.p[21],1);assert.equal(c.enemyBar,1)});
test('bar checkers enter first',()=>{const b=initialBoard();b.bar=1;assert.ok(moves(b,3).every(m=>m.from===25))});
test('bearing off requires all checkers home and oversized dice cannot skip higher checkers',()=>{const b=initialBoard();assert.ok(!moves(b,6).some(m=>m.to===0));b.p=Array(25).fill(0);b.p[4]=1;b.p[6]=1;assert.ok(!moves(b,5).some(m=>m.from===4));b.p[6]=0;assert.ok(moves(b,5).some(m=>m.from===4&&m.to===0))});
test('doubles provide four moves',()=>{assert.ok(turns(initialBoard(),[2,2,2,2]).every(t=>t.length===4))});
test('higher die is required if only one can be used',()=>{const b=initialBoard();b.p=Array(25).fill(0);b.p[1]=1;assert.equal(turns(b,[1,2])[0][0].die,2)});

function emptyBoard(){return {p:Array(25).fill(0),bar:0,enemyBar:0,off:0};}

test('a blocked bar entry cannot be bypassed by moving an on-board checker',()=>{
 const b=emptyBoard();b.bar=1;b.p[6]=1;b.p[22]=-2;
 assert.deepEqual(moves(b,3),[]);
});

test('entry hits a blot without mutating the original board',()=>{
 const b=emptyBoard();b.bar=1;b.p[22]=-1;
 const before=structuredClone(b);
 const c=apply(b,{from:25,to:22,die:3});
 assert.deepEqual(b,before);assert.notEqual(c.p,b.p);
 assert.equal(c.bar,0);assert.equal(c.enemyBar,1);assert.equal(c.p[22],1);
});

test('both dice must be used even when one playable order gets stuck',()=>{
 const b=emptyBoard();b.p[4]=1;b.p[1]=1;b.p[2]=-2;
 const paths=turns(b,[1,2]);
 assert.ok(paths.length>0);assert.ok(paths.every(path=>path.length===2));
 assert.ok(paths.some(path=>path[0].from===4&&path[0].to===3));
 assert.ok(!paths.some(path=>path[0].from===1&&path[0].to===0));
});

test('the lower die is allowed when the higher die has no legal move',()=>{
 const b=emptyBoard();b.bar=1;b.p[19]=-2;b.p[18]=-2;
 assert.deepEqual(turns(b,[1,6]),[[{from:25,to:24,die:1}]]);
});

test('exact bearing off is allowed with a checker on a higher point',()=>{
 const b=emptyBoard();b.p[4]=1;b.p[6]=1;
 assert.ok(moves(b,4).some(m=>m.from===4&&m.to===0));
 const c=apply(b,{from:4,to:0,die:4});
 assert.equal(c.off,1);assert.equal(c.p[4],0);assert.equal(c.p[6],1);
});

test('a fully blocked turn returns an empty path',()=>{
 const b=emptyBoard();b.bar=1;b.p[24]=-2;b.p[23]=-2;
 assert.deepEqual(turns(b,[1,2]),[[]]);
});
