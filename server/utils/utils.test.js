const utils = require('./utils');
const  expect = require('expect');

describe('Utils Test', () => {

// it('should async add two number', (done) => {
//     utils.asyncAdd(4, 3, (sum)=>{
//     expect(sum).toBe(7).toBeA('number');
//     done();
// });
// })

it('should add two numbers', () =>{
    var res = utils.add(33, 11);
    expect(res).toBe(44).toBeA('number');
   // expect({name: 'Abet'}).toEqual({name: 'Abet'});
   // expect([1,2,3]).toInclude(2);
   // expect([1,2,3]).toExclude(4);
   // expect({
   //     name: 'Bola',
   //     age: 56,
   //     location: 'lagos'
   // }).toInclude({
   //     age: 56
   // })
})
})