<template>
  <section id="app" class="comments">
    <article v-for="(comment, index) in comments" :key="index">
      <img
        class="profile-photo"
        :src="comment.avatar"
        :alt="comment.author"
      />
      <h4><a href="#">{{ comment.author }}</a></h4>
      <time>{{ comment.time }}</time>
      <like></like>
      <p v-html="comment.text"></p>
    </article>
  </section>
</template>

<script>
// 子组件：点赞功能
import img1 from '@/assets/me.jpg'
const Like = {
  template: `
    <div class="like-data">
      <button class="icon-rocknroll" :class="{ active: liked }" @click="toggleLike">
        &hearts;
      </button>
      <span class="like-count" :class="{ active: liked }">
        {{ likesCount }}
      </span>
    </div>`,
  data() {
    return {
      liked: false,
      likesCount: 0
    };
  },
  methods: {
    toggleLike() {
      this.liked = !this.liked;
      this.liked ? this.likesCount++ : this.likesCount--;
    }
  }
};

export default {
  name: 'CommentsBoard',
  components: {
    Like
  },
  data() {
    return {
      // 示例数据，你可以替换为实际的留言数据
      comments: [
        {
          avatar: img1,
          author: '一路向北',
          time: '2026/07/05',
          text: '现在还不会后端写不了这个留言板,打算先把前端先写好,后面再看看怎么搞'
        },
      ]
    };
  }
};
</script>

<style scoped>
/* 引入原字体 */

* {
  box-sizing: border-box;
}
a, a:hover {
  transition: 0.25s color linear;
}
article time, article:hover time,
.icon-rocknroll, .like-count {
  transition: 0.25s opacity linear;
}

html {
  font-size: 16px;
}
body {
  color: #444;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.65;
  margin: 50px 0;
  padding: 0 25px;
}
.comments {
  max-width: 450px;
  margin: 50px auto;
}
.comments article {
  position: relative;
  border-bottom: solid 1px rgba(178, 179, 153, 0.125);
  margin: 0 auto 50px auto;
}
.comments article:last-child {
  border: none;
}
.comments article:hover time {
  opacity: 1;
}
.comments article img {
  position: absolute;
  top: -10px;
  left: -75px;
  width: 50px;
  height: 50px;
  border-width: 0;
  border-radius: 100%;
}
.comments article h4 {
  display: inline-block;
  font-weight: 400;
  margin-bottom: 25px;
}
.comments article h4 a {
  color: #404040;
  text-transform: lowercase;
  text-decoration: none;
}
.comments article h4 a:hover {
  color: #BFBFA8;
}
.comments article time {
  color: #545454;
  margin-left: 1rem;
  text-transform: uppercase;
}
.comments article .icon-rocknroll {
  color: #545454;
  font-size: 0.85rem;
}
.comments article .icon-rocknroll:hover {
  opacity: 0.5;
}
.comments article time,
.comments article .like-count,
.comments article .icon-rocknroll {
  font-size: 0.75rem;
  opacity: 0;
}
.comments article time,
.comments article .like-count {
  font-weight: 300;
}
.comments article p {
  margin-bottom: 50px;
}
.comments article p .reply {
  color: #BFBFA8;
  cursor: pointer;
}
.comments article .active {
  opacity: 1;
}
.like-data {
  float: right;
}
.icon-rocknroll {
  background: none;
  border: 0;
  outline: none;
  cursor: pointer;
  margin: 0 0.125rem 0 0;
  padding: 0;
}
.comments article:hover .icon-rocknroll,
.comments article:hover .like-count {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 650px) {
  .comments {
    width: 100%;
    padding: 0 1rem;
  }
  .comments article {
    width: 90%;
  }
  .comments article .profile-photo {
    position: relative;
    left: -1rem;
    display: inline-block;
    vertical-align: middle;
  }
  .comments article h4 {
    display: inline-block;
    vertical-align: middle;
  }
  .comments article h4 time {
    display: block;
    margin-left: 0 !important;
    opacity: 0.5 !important;
  }
}
</style>