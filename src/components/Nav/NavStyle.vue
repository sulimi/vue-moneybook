<template>
  <div class="layout-wrapper">
    <header class="header">

      <Icon name="set" class="set" @click="say"></Icon>
      <div class="header"><slot name="header"></slot></div>
      <Icon name="me" class="me" @click="say"></Icon>
      <NoAction v-if="$store.state.noAction"></NoAction>
      <Fail v-if="$store.state.isFail"></Fail>
    </header>
    <main class="main" :class=" classPrefix && `${classPrefix}-content` ">
      <slot name="main"></slot>
    </main>
    <footer class="footer">
      <Nav/>
    </footer>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Prop} from 'vue-property-decorator';
  import Succeed from '@/components/Succeed.vue';
  import NoAction from '@/components/NoAction.vue';
  import Fail from '@/components/Fail.vue';
  @Component({
    components: {Fail, NoAction, Succeed}
  })
  export default class NavStyle extends Vue {
    @Prop() classPrefix!: string;
    @Prop() value!: string;

    say(){
      if(!this.$store.state.noAction){
        this.$store.state.noAction=!this.$store.state.noAction
      }
    }
  }
</script>

<style lang="scss">
  .layout-wrapper {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }


  .header, {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    height: 6vh;
    border-bottom: 1px solid rgb(243, 243, 243);

    .icon.set, .icon.me {
      width: 24px;
      height: 24px;
      margin: 0 16px;
    }

/*    .say {
      z-index: 9;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(43,43,43, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      .value{
        !*background: rgba(243,243,243,0.8);*!
        text-align: center;
        padding: 0 6px;
        font-size: 14px;
        border-radius: 7px;
      }
    }*/
  }
  .main {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
  }


  .footer {
    background: #f3f3f3;
  }
</style>