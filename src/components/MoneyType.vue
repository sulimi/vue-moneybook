<template>
  <div class="tabs" :class="{[classPrefix+'-tabs']:classPrefix}">
    <div class="tabs-type"
         v-for="tab in dataSource"
         :key="tab.value"
         :class="liClass(tab)"
         @click="select(tab)"
    >
      <span>{{tab.text}}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {Component, Prop} from 'vue-property-decorator';


  @Component
  export default class Tabs extends Vue {
    @Prop({required: true, type: Array})
    dataSource!: DataSourceItem[];

    @Prop(String)
    readonly value!: string;


    @Prop(String)
    classPrefix?: string;

    liClass(tab: DataSourceItem) {
      return {
        [this.classPrefix + '-type']: this.classPrefix, selected: tab.value === this.value
      };
    }

    @Prop(String)
    readonly showvalue!: string;

    select(tab: DataSourceItem) {
      if (this.$route.params.id) {
        this.$store.state.currentRecord.type !== tab.value?this.$store.state.currentTag='':''
        this.$store.state.currentRecord.type = tab.value;
      } else {
        this.$emit('update:value', tab.value);
        this.$emit('update:showvalue', tab.text);
      }
      if (this.$store.state.showtype) {
        this.$store.state.showtype = !this.$store.state.showtype;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tabs {
    background: rgb(243, 243, 243);
    color: #767676;
    display: flex;

    &-type {
      width: 50%;
      height: 4vh;
      display: flex;
      justify-content: center;
      align-items: center;

      &.selected {
        background: #DE7873;
        color: white;
      }

      .icon {
        width: 24px;
        height: 24px;
      }
    }
  }
</style>