import Vue from 'vue';
import Vuex from 'vuex';
import clone from '@/lib/clone';
import createId from '@/lib/createId';
import router from '@/router';
import tagInit from '@/constants/tagInit';
import dayjs from 'dayjs';

Vue.use(Vuex);


const store = new Vuex.Store({
  state: {
    record: {tags: [], notes: '', type: '-', amount: 0, createdAt: new Date().toISOString()},
    recordList: [],
    tagList: [],
    dayRecordList: [],
    currentTag: undefined,
    isHave: true,
    showBody: false,
    numberShow: false,
    showAdd:false
  } as RootState,

  mutations: {

    fetchRecords(state) {
      state.recordList = JSON.parse(window.localStorage.getItem('recordList') || '[]') as RecordItem[];
    },
    createRecord(state, record: RecordItem) {
      const recordDeep: RecordItem = clone(record);
      if (!recordDeep.tags || recordDeep.tags.length === 0) {
        return window.alert('选择一项标签会更好分类哦');
      }
      if (!recordDeep.amount || recordDeep.amount === 0) {
        return window.alert('请输入金额');
      }
      state.recordList.push(recordDeep);
      store.commit('saveRecords');
      window.alert('记账成功');
    },
    saveRecords(state) {
      window.localStorage.setItem('recordList', JSON.stringify(state.recordList));
    },

    setCurrentTag(state, id: string) {
      state.currentTag = state.tagList.filter(t => t.id === id)[0];
    },
    fetchTags(state) {
      state.tagList = JSON.parse(window.localStorage.getItem('tagList') || '[]');
      if (!state.tagList || state.tagList.length === 0) {
        tagInit.forEach(item => {
          return store.commit('createTag', {name: item.name, tagicon: item.tagicon, type: item.type});
        });

      }
    },
    createTag(state, payload: { name: string; tagicon: string; type: string }) {
      const {name, tagicon, type} = payload;
      state.isHave = true;
      const names = state.tagList.map(item => item.name);
      if (names.indexOf(name) >= 0) {
        state.isHave = false;
      } else {
        const id = createId().toString();
        state.tagList.push({id, name: name, tagicon: tagicon, type: type});
        store.commit('saveTags');
      }
    },
    removeTag(state, id: string) {
      const tag = state.tagList.filter(item => item.id === id)[0];
      if (tag) {
        const index = state.tagList.indexOf(tag);
        state.tagList.splice(index, 1);
        store.commit('saveTags', id);
        window.alert('删除成功');
        router.back();
      } else {
        window.alert('删除失败');
      }
    },
    updateTag(state, payload: { id: string; name: string }) {
      const {id, name} = payload;
      const idList = state.tagList.map(item => item.id);
      if (idList.indexOf(id) >= 0) {
        const names = state.tagList.map(item => item.name);
        if (names.indexOf(name) >= 0) {
          window.alert('标签名未作修改');
        } else if (name === '') {
          window.alert('标签名不能为空，请重新编辑');
        } else {
          const tag = state.tagList.filter(item => item.id === id)[0];
          tag.name = name;
          store.commit('saveTags');
          window.alert('更改成功');
          router.replace('/managetag').then();
        }
      }
    },
    saveTags(state) {
      window.localStorage.setItem('tagList', JSON.stringify(state.tagList));
    },


    // [
    //   {"tags":[{"id":"1","name":"衣","tagicon":"date"}],   "notes":"","type":"-","amount":8,   "createdAt":"2020-09-11T23:36:23.663Z"},
    //   {"tags":[{"id":"1","name":"衣","tagicon":"date"}],   "notes":"","type":"-","amount":9,   "createdAt":"2020-09-11T23:36:23.663Z"},
    //   {"tags":[{"id":"1","name":"衣","tagicon":"date"}],   "notes":"","type":"-","amount":5,   "createdAt":"2020-09-11T23:40:11.700Z"},
    //   {"tags":[{"id":"3","name":"住","tagicon":"label"}],  "notes":"","type":"+","amount":58,  "createdAt":"2020-09-11T23:40:11.700Z"},
    //   {"tags":[{"id":"3","name":"住","tagicon":"label"}],  "notes":"","type":"+","amount":9,   "createdAt":"2020-09-11T23:40:11.700Z"},
    //   {"tags":[{"id":"1","name":"衣","tagicon":"date"}],   "notes":"","type":"-","amount":88,  "createdAt":"2020-09-21T16:00:00.000Z"}
    // ]

    //按天

    createdDayRecordList(state, payload: {recordList: RecordItem[]; type: string}) {
      const {recordList, type} = payload
      const newRecordList: any = clone(recordList); //先复制一份原数据
      console.log(newRecordList);
      newRecordList.filter((item: RecordItem) => (item as any).type === type) //按支出和收入筛选
        .sort((a: RecordItem, b: RecordItem) =>   //再按日期排序，valueOf是把数据变成数字（时间戳）然后比较
          dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
        );
      console.log(newRecordList);
      if (newRecordList.length === 0) {
        return [];
      }
      //做渲染数据：哈希表   结构：[{title:2020-9-11,items:[{},{},{}]}，{title:2020-9-12,items:[{},{},{}]}]
      const dayResult: Result[] = [{  //拿出第一项做参照物，之前已经按日期排好了
        title: dayjs(newRecordList[0].createdAt).format('YYYY-M-D'),
        items: [newRecordList[0]]
      }];
      for (let i = 1; i < newRecordList.length; i++) {
        const current = newRecordList[i];
        const last = dayResult[dayResult.length - 1];  //拿最后一项
        if (dayjs(last.title).isSame(dayjs(current.createdAt), 'day')) {  //按照同一天分组
          last.items.push(current);
        } else {
          dayResult.push({title: dayjs(current.createdAt).format('YYYY-M-D'), items: [current]});
        }
      }
      dayResult.forEach(group => {
        group.total = group.items.reduce((sum, item) => {  //算合计
          return sum + item.amount;
        }, 0);
      });
      state.dayRecordList = dayResult;
    },

  }
});

export default store;