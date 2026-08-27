// 提前拉取文章详情页的代码分包（chunk），消除点击跳转时的加载卡顿。
export function prefetchArticleDetail(): void {
  import('@/modules/bloghome/components/articles/ArticleDetail.vue').catch(() => {
    // 预取失败静默忽略，不影响后续正常导航
  })
}
