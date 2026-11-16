// 提前拉取文章详情页的代码分包
export function prefetchArticleDetail(): void {
  import('@/modules/bloghome/components/articles/ArticleDetail.vue').catch(() => {
    // 预取失败静默忽略
  })
}
