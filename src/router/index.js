import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'hash',
    routes: [{
        //路径为空时跳到发现音乐
        path: '',
        redirect: '/musicHome/findMusic',
    },
    {
        path: '/musicHome',
        name: 'musicHome',
        component: () =>
            import('@/views/musicHome'),
        children: [
            // 发现音乐模块
            {
                path: '/musicHome/findMusic',
                name: 'findMusic',
                redirect: '/musicHome/findMusic/songList',
                component: () =>
                    import('@/views/musicHome/findMusic/findMusic'),
                children: [
                    // 歌单
                    {
                        path: '/musicHome/findMusic/songList/',
                        name: 'songList',
                        component: () =>
                            import('@/views/musicHome/findMusic/songList/songList')
                    }
                ]
            },
            // 我的音乐云盘模块
            {
                path: '/musicHome/myCloudMusic',
                name: 'myCloudMusic',
                component: () =>
                    import('@/views/musicHome/myCloudMusic/myCloudMusic')
            },
            // 我喜欢的音乐模块
            {
                path: '/musicHome/myFavoriteMusic',
                name: 'myFavoriteMusic',
                component: () =>
                    import('@/views/musicHome/myFavoriteMusic/myFavoriteMusic')
            },
            // 我的歌单音乐模块
            {
                path: '/musicHome/mySongListMusic',
                name: 'mySongListMusic',
                component: () =>
                    import('@/views/musicHome/mySongListMusic/mySongListMusic')
            },
            // 歌单详情模块
            {
                path: '/musicHome/songList/:id',
                component: () =>
                    import('@/views/musicHome/songListPage/songListPage'),
            },
            // 歌曲详情模块
            {
                path: '/musicHome/songDetail',
                component: () =>
                    import('@/views/musicHome/songDetail/songDetail'),
            }
        ]
    }
    ]
})
export default router