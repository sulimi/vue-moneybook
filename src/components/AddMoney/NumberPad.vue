<template>
  <div>
    <div class="inputNumber">
      <div class="num"><span class="text">{{this.$store.state.record.type==='-'?'支出':'收入'}}：</span><span
        class="num-intpu" :class="[{first:one},{second:two}]">{{output}}</span></div>
    </div>
    <div class="numberPad">
      <button @click="inputContent" class="left">+</button>
      <button @click="inputContent">1</button>
      <button @click="inputContent">2</button>
      <button @click="inputContent">3</button>
      <button @click="remove">
        <Icon name="remove"></Icon>
      </button>
      <button @click="inputContent" class="left">-</button>
      <button @click="inputContent">4</button>
      <button @click="inputContent">5</button>
      <button @click="inputContent">6</button>
      <button @click="clear">C</button>
      <button @click="inputContent" class="left">×</button>
      <button @click="inputContent">7</button>
      <button @click="inputContent">8</button>
      <button @click="inputContent">9</button>
      <button @click="equal" class="equal" v-if="isCount&&lock">=</button>
      <button @click="ok" class="ok" v-else>{{$route.params.id?'修改':'OK'}}</button>
      <button @click="inputContent" class="left">÷</button>
      <button @click="inputContent" class="zero">0</button>
      <button @click="inputContent">.</button>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Prop} from 'vue-property-decorator';
  import Days from '@/components/Calender.vue';
  import Fail from '@/components/Fail.vue';
  // import DayBook from '@/components/AddMoney/DayBook.vue';

  @Component({
    components: {Fail, Days}
  })
  export default class NumberPad extends Vue {
    @Prop() readonly value!: number;
    output = this.value.toString();
    isOver = true;
    one = false;
    two = false;
    lock = true;

    created() {
      !this.$route.params.id ? this.output = '0' : this.output = Math.abs(+this.output).toString();
    }

    get recordList() {
      return this.$store.state.recordList;
    }

    get dotLast() {
      return this.output.charAt(this.output.length - 1) === '.';
    }

    get operatorLast() {
      return this.output.charAt(this.output.length - 1) === '÷' || this.output.charAt(this.output.length - 1) === '×' || this.output.charAt(this.output.length - 1) === '+' || this.output.charAt(this.output.length - 1) === '-';
    }

    get isHaveOperator() {
      return this.output.indexOf('÷') >= 0 || this.output.indexOf('+') >= 0 || this.output.indexOf('×') >= 0 || this.output.indexOf('-') >= 0;
    }

    get isCount() {
      return this.isHaveOperator || this.dotLast;
    }

    inputContent(event: MouseEvent) {
      this.lock = true;
      const input = (event.target as HTMLButtonElement).textContent!;

      if (this.output && this.output === '0') {
        if ('0123456789'.indexOf(input) >= 0) {
          this.output = '';
          this.output = input;
        } else {
          this.output += input;
        }
        return;
      }     //0时输入
      if (this.output.length === 1 && this.isHaveOperator) {
        this.output = '0' + this.output;
      }
      if (this.isHaveOperator) {
        if (this.operatorLast && '÷×+-'.indexOf(input) >= 0) {
          this.output = this.output.slice(0, this.output.length - 1) + input;
          return;
        } else if ('÷×+-'.indexOf(input) >= 0) {
          this.count();
        }
      }  //输入运算符：最后一个替换


      if (this.output.indexOf('.') >= 0 && input === '.') {
        if (this.isHaveOperator) {
          const arr = this.output.split('.');
          if (arr.length === 3 && (arr[1].includes('÷') || arr[1].includes('×') || arr[1].includes('+') || arr[1].includes('-'))) {
            return;
          } else if (arr.length === 2 && (arr[0].includes('÷') || arr[0].includes('×') || arr[0].includes('+') || arr[0].includes('-')) && !(arr[1].includes('÷') || arr[1].includes('×') || arr[1].includes('+') || arr[1].includes('-'))) {
            if (!this.isOver && input === '.') {
              this.output = '0' + input;
              this.isOver = !this.isOver;
            }
            return;
          }
        } else {
          if (!this.isOver) {
            this.output = '0' + input;
            this.isOver = !this.isOver;
            return;
          } else {
            return;
          }

        }
      }   //符号两边只能有一个小数点

      if (this.dotLast && '÷×+-'.indexOf(input) >= 0) {
        this.output += 0;
        if (this.output === '0.0') {
          this.output = '0';
        }
      }    //当在【.】后面直接输入加减乘除号时，点后加0或者把点取消

      if (this.operatorLast && input === '.') {
        this.output += 0; //这个试出来的
      }   // //在加减乘除号后面输入【.】时

      if (this.output.length === 9) {
        this.one = true;
      } else if (this.output.length === 12) {
        this.two = true;
      } else if (this.output.length === 14) {
        this.$store.state.isFail='输入金额过长'
        return;
      }  //输入过长

      if (!this.isOver) {
        if ('÷×+-'.indexOf(input) >= 0) {
          this.output += input;
          this.isOver = true;
          return;
        } else if (input === '.') {
          this.output = '0' + input;
          this.isOver = true;
          return;
        }
        this.output = '';
        this.isOver = true;
      } //运算完输入时
      this.output += input;
    }

    remove() {
      this.output = this.output.slice(0, -1);
      if (this.output.length <= 12) {
        this.two = false;
      }
      if (this.output.length <= 9) {
        this.one = false;
      }
      if (this.output.length === 0) {
        this.output = '0';
      }
    }

    clear() {
      this.output = '0';
      this.one = false;
      this.two = false;
    }

    division() {
      let [a, b, c] = this.output.split('÷');
      a = a || '1';  //输入【4÷】结果NaN的bug
      b = b || '1';
      c = c || '1';
      const result = (parseFloat(a) / parseFloat(b) / parseFloat(c)).toFixed(2);
      this.output = '' + parseFloat(result);
    }

    times() {
      let [a, b, c] = this.output.split('×');
      a = a || '1';
      b = b || '1';
      c = c || '1';
      const result = (parseFloat(a) * parseFloat(b) * parseFloat(c)).toFixed(2);
      this.output = '' + parseFloat(result);
    }

    add() {
      let [a, b, c] = this.output.split('+');
      a = a || '0';
      b = b || '0';
      c = c || '0';
      const result = (parseFloat(a) + parseFloat(b) + parseFloat(c)).toFixed(2);
      this.output = '' + parseFloat(result);
    }

    minus() {
      let [a, b, c] = this.output.split('-');
      a = a || '0';
      b = b || '0';
      c = c || '0';
      const result = (parseFloat(a) - parseFloat(b) - parseFloat(c)).toFixed(2);
      this.output = '' + parseFloat(result);
    }

    equal() {
      this.lock = false;
      this.count();
      if (this.dotLast) {
        this.output = this.output.slice(0, this.output.length - 1);
      }
      this.isOver = false;
      if (this.output.length < 12) {
        this.two = false;
      }
      if (this.output.length < 9) {
        this.one = false;
      }
    }

    count() {
      if (this.output.indexOf('÷') >= 0) {
        this.division();
      } else if (this.output.indexOf('×') >= 0) {
        this.times();
      } else if (this.output.indexOf('+') >= 0) {
        this.add();
      } else if (this.output.indexOf('-') >= 0) {
        this.minus();
      }
    }

    ok() {
      const moneyValue = parseFloat(parseFloat(this.output).toFixed(2));
      if (moneyValue < 0) {
        this.$store.state.isFail='负值不能入账哦,请重新输入呢'
        return;
      }

      if (!this.$store.state.currentTag) {
        this.$store.state.isFail='选择一项标签会更好分类哦'
        return;
      }
      if (this.$route.params.id) {
        if (moneyValue === 0) {
          this.$store.state.isFail='请输入金额';
          return;
        }
        let amount;
        if (this.$store.state.currentRecord.type === '-') {
          amount = -moneyValue;
        } else {
          amount = moneyValue;
        }
        this.$emit('update:value', amount);
        this.$store.commit('saveRecords');
        this.$store.state.isSucceed = '账单编辑成功！';
        return;
      }

      this.$emit('update:value', moneyValue);//把输入的字符串变成数字记入账单
      this.$emit('submit', moneyValue);
      this.output = '0';
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@/assets/style/helper.scss";


  .inputNumber {
    padding: 16px;
    height: 60px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    word-break: break-all;
    overflow: hidden;
    background: #fff;
    border-bottom: 1px solid #f3f3f3;
    box-shadow: inset 0 3px 11px -9px #999;

    .num {
      display: flex;
      align-items: center;

      .text {
        font-size: 16px;
      }

      .num-intpu {
        font-size: 36px;

        &.first {
          font-size: 32px;
        }

        &.second {
          font-size: 28px;
        }
      }
    }
  }

  .numberPad {
    @extend %clearFix;
    font-size: 22px;
    background: rgb(243, 243, 243);

    button {
      background: #fff;
      border: 1px solid #f3f3f3;
      box-shadow: inset 0 3px 10px -11px #999;
      width: 18.8%;
      height: 58px;
      float: left;
      margin: 0.5%;

      &.left {
        margin-left: 1%;
      }

      &.ok,
      &.equal {
        height: 60*2px;
        float: right;
      }

      &.ok{
        margin-right: 1%;
      }

      &.zero {
        width: 19.3*2%;
      }
    }
  }
</style>