<template>
  <div class="vasari-shelf-container" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
    @pointercancel="onPointerUp" @wheel.prevent="onWheel">
    <!-- 地面柔和漫反射环境光阴影 -->
    <div class="shelf-ground-shadow" aria-hidden="true"></div>

    <!-- 3D 弧形舞台 -->
    <div class="shelf-stage">
      <!-- 注意：位置 / 层级 / 遮罩由动画循环直接写进 DOM（见 applyLayout），
           所以这里不再绑定 :style，只登记元素引用 -->
      <div v-for="(album, index) in albums" :key="album.id || index" :ref="(el) => setSlotRef(el, index)"
        class="book-slot" :class="{
          'is-center': index === activeIndex,
          'is-side': index !== activeIndex,
          'is-open': index === activeIndex && isOpen
        }" @click="onBookClick(album, index)" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = -1">
        <!-- 3D 实体书盒 -->
        <div class="book-box" :style="{ '--theme-color': themeOf(index).paper, '--ink': themeOf(index).ink }">

          <!-- 设计思路：书脊 = 封面同一张纸。纸色、墨色取自封面，
               再把封面里最有代表性的一小块画面"裁"到书脊上。 -->
          <div class="box-spine" :style="{
            '--paper': themeOf(index).paper,
            '--ink': themeOf(index).ink
          }">
            <!-- 整条书脊的插画层：坐标系 42 × 330，与书脊 1:1 对应 -->
            <svg class="spine-art" viewBox="0 0 42 330" preserveAspectRatio="xMidYMid meet" aria-hidden="true">

              <!-- 动漫：蓝色洞口里伸出一只挥动的手 -->
              <g v-if="themeOf(index).motif === 'hand'">
                <ellipse cx="21" cy="270" rx="17" ry="8.5" fill="#6B7FA8" />
                <ellipse cx="17" cy="272" rx="9" ry="4" fill="#5E7298" opacity="0.45" />
                <path d="M20.2 278 L20.8 256 L26.2 256 L26.4 277.6 Z" fill="#EDAA8F" />
                <path d="M20.6 257 C19 253 18.8 249.5 20 247.5 L26 246.5 C27.4 249.5 27 254 26.2 257 Z"
                  fill="#EDAA8F" />
                <g stroke="#EDAA8F" stroke-width="1.9" stroke-linecap="round" fill="none">
                  <path d="M20.4 249 L14.8 244.5" />
                  <path d="M21.2 247.6 L16.4 240" />
                  <path d="M22.8 246.8 L19.4 237.6" />
                  <path d="M24.6 246.6 L23.4 238.4" />
                  <path d="M26 253 L28.6 246.2" />
                </g>
              </g>

              <g v-if="themeOf(index).motif === 'swing'" stroke-linecap="round" stroke-linejoin="round">

                <!-- 1. 超长秋千长绳 (带自然手绘微垂感的纤细双股绳) -->
                <g stroke="#3A3733" stroke-width="0.38" fill="none" opacity="0.85">
                  <!-- 男孩秋千绳 (左侧两组长缆) -->
                  <path d="M 11.2 0 C 11.6 70, 11.0 145, 11.4 214" />
                  <path d="M 12.1 0 C 12.5 70, 11.9 145, 12.3 214" />
                  <path d="M 16.6 0 C 16.3 70, 16.8 145, 16.5 214" />
                  <path d="M 17.5 0 C 17.2 70, 17.7 145, 17.4 214" />

                  <!-- 女孩秋千绳 (右侧两组长缆，稍高一点) -->
                  <path d="M 24.8 0 C 24.5 70, 24.9 140, 24.6 206" />
                  <path d="M 25.6 0 C 25.3 70, 25.7 140, 25.4 206" />
                  <path d="M 29.3 0 C 29.5 70, 29.2 140, 29.4 206" />
                  <path d="M 30.2 0 C 30.4 70, 30.1 140, 30.3 206" />
                </g>

                <!-- 2. 左侧：坐在秋千上的男孩 (侧身伸手前倾) -->
                <g id="boy">
                  <!-- 秋千木板底座 -->
                  <path d="M 10.2 214.2 C 13.5 215.2, 16 215.2, 18.5 214" stroke="#2B2825" stroke-width="0.8"
                    fill="none" />
                  <!-- 木板下垂挂绳结 -->
                  <path d="M 11.4 214.5 L 11.2 217.5 M 17.4 214.5 L 17.6 217.5" stroke="#3A3733" stroke-width="0.4" />

                  <!-- 腿部与深色长裤 (膝盖自然弯曲下垂) -->
                  <g fill="#2B2825" stroke="#2B2825" stroke-width="0.3">
                    <!-- 屈膝坐姿大腿 -->
                    <path d="M 12.2 211 L 16.5 211.5 L 16.8 216 L 12.2 215.5 Z" />
                    <!-- 左小腿与黑色鞋子 -->
                    <path d="M 12.4 215.5 L 12.2 222.5 L 11.4 224 L 13.4 224 L 13.5 215.8 Z" />
                    <!-- 右小腿 (在后方微露) -->
                    <path d="M 15.0 216 L 15.3 223 L 14.5 224.5 L 16.5 224.5 L 16.2 216 Z" />
                  </g>

                  <!-- 浅色上衣躯干 (白色填充，遮蔽背景秋千绳) -->
                  <path d="M 12.6 201 
             C 14.2 201.5, 15.6 202, 16.2 203 
             L 15.5 211.8 
             C 14.2 211.5, 13.0 211.2, 12.0 210.8 Z" fill="#FAF9F5" stroke="#2B2825" stroke-width="0.6" />

                  <!-- 头部与黑发 -->
                  <path d="M 13.2 196.5 
             C 12.2 196.5, 11.5 197.8, 11.6 199.5 
             C 11.7 200.5, 12.5 201.2, 13.8 201 
             C 14.8 200.8, 15.2 199.5, 15.0 198 
             C 14.8 196.8, 14.2 196.5, 13.2 196.5 Z" fill="#242220" />
                  <!-- 脸部微凸轮廓 (面向右侧) -->
                  <path d="M 14.2 198.5 C 14.8 199, 14.8 199.8, 14.2 200.5" stroke="#2B2825" stroke-width="0.4"
                    fill="none" />

                  <!-- 左手：握住身后的秋千绳 -->
                  <path d="M 12.8 203 C 12.2 205, 11.6 207, 11.6 209" stroke="#2B2825" stroke-width="0.65"
                    fill="none" />

                  <!-- ★ 右手：笔直向右平伸，食指前探 -->
                  <path d="M 15.6 203.2 
             C 17.2 203.5, 18.8 203.8, 20.4 204.0" stroke="#2B2825" stroke-width="0.68" fill="none" />
                  <!-- 手掌与伸出的指尖 -->
                  <circle cx="20.6" cy="204.0" r="0.3" fill="#2B2825" />
                </g>

                <!-- 3. 右侧：坐在秋千上的女孩 (荡得稍高，身体前倾迎向男孩) -->
                <g id="girl">
                  <!-- 秋千木板底座 -->
                  <path d="M 23.8 206.2 C 26.8 207.2, 29.2 207.2, 31.4 206" stroke="#2B2825" stroke-width="0.8"
                    fill="none" />
                  <path d="M 25.4 206.5 L 25.2 209.5 M 30.3 206.5 L 30.5 209.5" stroke="#3A3733" stroke-width="0.4" />

                  <!-- 腿部与深色裤袜 (双腿后收微屈，轻盈柔美) -->
                  <g fill="#2B2825" stroke="#2B2825" stroke-width="0.3">
                    <path d="M 25.2 204.5 L 28.5 205.5 L 28.0 210 L 24.8 209 Z" />
                    <!-- 小腿轻盈向后收拢 -->
                    <path d="M 25.6 209.5 C 26.2 212.5, 27.2 215, 27.8 217.5 L 26.8 218 L 24.8 211 Z" />
                    <circle cx="27.6" cy="218.2" r="0.6" /> <!-- 小鞋子 -->
                  </g>

                  <!-- 斜挎小布包 (原图特色小细节) -->
                  <ellipse cx="28.8" cy="204.8" rx="1.2" ry="1.6" fill="#D3CEBE" stroke="#2B2825" stroke-width="0.35" />
                  <path d="M 26.4 198.5 L 28.2 204" stroke="#2B2825" stroke-width="0.3" fill="none" />

                  <!-- 浅色上衣 (遮蔽后方绳索) -->
                  <path d="M 27.8 197.5 
             C 26.5 197.8, 25.2 199.2, 24.8 201 
             L 25.4 205.5 
             C 26.8 205.8, 28.2 205.5, 29.2 204.5 
             Z" fill="#FAF9F5" stroke="#2B2825" stroke-width="0.6" />

                  <!-- 头部与向后飘飞的齐肩发丝 (随风轻扬) -->
                  <!-- 飘拂的秀发 -->
                  <path d="M 26.2 195.2 
             C 27.5 194.8, 29.5 195.0, 31.5 196.2 
             C 30.5 197.2, 28.5 197.8, 26.8 198.2 
             Z" fill="#242220" />
                  <!-- 脸部向左下方前探 -->
                  <circle cx="26.0" cy="196.5" r="1.2" fill="#242220" />
                  <path d="M 25.2 196.2 C 24.8 196.8, 24.8 197.5, 25.4 198" stroke="#2B2825" stroke-width="0.4"
                    fill="none" />

                  <!-- 左手：扶住外侧秋千绳保持平衡 -->
                  <path d="M 28.2 199 C 29.2 201, 29.8 202.5, 30.2 204" stroke="#2B2825" stroke-width="0.6"
                    fill="none" />

                  <!-- ★ 右手：向前向下温柔伸展，与男孩指尖几乎相碰 -->
                  <path d="M 25.0 199.2 
             C 23.8 200.5, 22.6 202.0, 21.6 203.2" stroke="#2B2825" stroke-width="0.68" fill="none" />
                  <circle cx="21.4" cy="203.4" r="0.3" fill="#2B2825" />
                </g>

              </g>

              <g v-if="themeOf(index).motif === 'lake'">
                <g transform="translate(21, 275) scale(0.48)">

                  <!-- 渐变与滤镜定义：还原赛里木湖标志性的宝蓝至钴蓝水质 -->
                  <defs>
                    <linearGradient id="sylWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#1B5B9E" />
                      <stop offset="35%" stop-color="#216DB5" />
                      <stop offset="100%" stop-color="#195493" />
                    </linearGradient>
                  </defs>

                  <!-- 1. 远景：连绵雪山 (天山山脉，圆润而具有层次的山脊与积雪) -->
                  <g id="snow-mountains">
                    <!-- 山体基底阴影岩石 (深灰褐色) -->
                    <path d="M -54 2 
               C -50 -1, -44 -4, -38 -5 
               C -35 -9, -32 -13, -27 -14 
               C -23 -11, -19 -16, -15 -18 
               C -11 -13, -6 -20, -2 -21 
               C 3 -19, 7 -21, 12 -18 
               C 16 -14, 20 -17, 24 -15 
               C 30 -11, 35 -13, 40 -8 
               C 45 -5, 50 -1, 54 2 
               Z" fill="#383531" />

                    <!-- 山体向阳受光坡面 (暖石灰调) -->
                    <path
                      d="M -44 -4 C -40 -3, -37 -8, -32 -8 L -27 -14 L -21 -10 L -15 -18 L -9 -12 L -2 -21 L 5 -15 L 12 -18 L 19 -11 L 24 -15 L 32 -9 L 40 -8 L 47 -2 L 53 2 L -52 2 Z"
                      fill="#6B665E" opacity="0.6" />

                    <!-- 积雪覆盖层 (柔和起伏的纯白雪冠与山坳雪舌) -->
                    <path d="M -52 1 
               C -47 -2, -43 -5, -38 -5 
               C -35 -7, -33 -12, -27 -14 
               C -25 -10, -21 -9, -15 -18 
               C -12 -12, -8 -13, -2 -21 
               C 2 -17, 6 -15, 12 -18 
               C 15 -12, 19 -12, 24 -15 
               C 28 -10, 34 -12, 40 -8 
               C 45 -4, 49 -1, 52 1
               C 46 -1, 41 -5, 36 -5 
               C 32 -4, 28 -8, 23 -8 
               C 19 -7, 16 -12, 11 -11 
               C 7 -10, 3 -13, -1 -13 
               C -6 -12, -10 -9, -14 -11 
               C -18 -8, -23 -8, -28 -7 
               C -34 -6, -40 -3, -46 0 Z" fill="#F6F7F9" />

                    <!-- 山脊阴影细腻素描线，赋予山峦挺拔感 -->
                    <g stroke="#262320" stroke-width="0.5" stroke-linecap="round" opacity="0.75">
                      <path d="M -27 -14 Q -25 -8 -23 -2" />
                      <path d="M -15 -18 Q -13 -10 -10 -2" />
                      <path d="M -2 -21 Q 0 -11 2 -2" />
                      <path d="M 12 -18 Q 14 -10 16 -1" />
                      <path d="M 24 -15 Q 26 -8 28 -1" />
                    </g>
                  </g>

                  <!-- 2. 中景：湖畔滩涂与左侧半岛沙嘴 (地貌灵魂) -->
                  <g id="shoreline">
                    <!-- 湖后岸平缓的浅灰碎石滩 -->
                    <path d="M -54 2 C -30 0, 20 0, 54 2 L 53 4 C 20 2.5, -30 2.5, -53 4 Z" fill="#524D46" />

                    <!-- ★ 原图精髓：左侧伸入湖心的狭长沙咀/半岛岬角 -->
                    <path d="M -53 3 
               C -46 3, -36 4, -28 5 
               C -24 5.5, -20 6.5, -16 6.8 
               C -21 7.5, -28 7, -35 6.5 
               C -42 6, -48 5, -52 4.5 Z" fill="#443F38" />
                    <!-- 半岛受光边缘白沙浪花线 -->
                    <path d="M -48 3.5 C -36 4.5, -26 5.8, -16 6.8" stroke="#E5E7EB" stroke-width="0.35" fill="none"
                      opacity="0.8" />
                  </g>

                  <!-- 3. 前景：纯净圆润的赛里木湖盆 (饱满优美的流体弧线) -->
                  <g id="lake-basin">
                    <!-- 核心湛蓝湖体：运用平滑贝塞尔圆角封闭曲线 -->
                    <path d="
        M -50 4
        C -36 2, -10 1.5, 0 1.5
        C 18 1.5, 38 2.2, 50 4
        C 53 5.5, 52 8, 48 11
        C 43 14.5, 39 16.5, 32 19
        C 24 22, 14 23.8, 2 24.2
        C -10 24.5, -22 23.5, -32 20.5
        C -40 18, -46 15, -49 11.5
        C -52 8, -52 5.5, -50 4
        Z" fill="url(#sylWaterGrad)" />

                    <!-- 湖底外围的温润水纹波浪切边 (增加圆润层次与手工木刻版画质感) -->
                    <path d="
        M -46 13
        C -38 18, -26 22, -12 23.5
        C 5 24.5, 20 23, 34 18.5
        C 41 16, 45 13, 47 11.5
        C 43 15, 38 17.5, 30 20
        C 18 23.5, 0 24.8, -14 24
        C -28 23, -39 19, -46 13
        Z" fill="#124375" opacity="0.4" />

                    <!-- 湖面微风吹拂的微光细纹 (波光粼粼) -->
                    <g stroke="#8EC1ED" stroke-width="0.3" stroke-linecap="round" opacity="0.45">
                      <line x1="-25" y1="11" x2="-14" y2="11" />
                      <line x1="8" y1="9" x2="22" y2="9" />
                      <line x1="-8" y1="15" x2="6" y2="15" />
                      <line x1="16" y1="16" x2="28" y2="16" />
                      <line x1="-20" y1="18" x2="-6" y2="18" />
                      <line x1="4" y1="20" x2="15" y2="20" />
                    </g>
                  </g>

                  <!-- 4. 画报文字点缀 (如需纯净图案，可随时整体注释或删除本组) -->
                  <g id="typography" fill="#2E2B27" text-anchor="middle"
                    font-family="'Times New Roman', Georgia, serif">
                    <!-- 顶部缩写字母 S  Y  L (Sayram Lake) -->
                    <text x="0" y="-30" font-size="3.2" letter-spacing="10" opacity="0.85">SYL</text>
                    <!-- 极小副标题 -->
                    <text x="0" y="-26" font-size="1.4" letter-spacing="0.8" opacity="0.55">SAYRAM</text>
                    <text x="0" y="-24" font-size="1.1" letter-spacing="0.6" opacity="0.45">HIGH WATER · WEST
                      WIND</text>
                    <!-- 底部弧形诗意文案 -->
                    <text x="0" y="30" font-size="1.5" letter-spacing="1.2" opacity="0.65">THE LAKE HOLDS THE SKY</text>
                  </g>

                </g>
              </g>

              <g v-if="themeOf(index).motif === 'ink'">
                <defs>
                  <linearGradient id="spine-ink-fade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#262626" stop-opacity="1" />
                    <stop offset="0.5" stop-color="#262626" stop-opacity="0.92" />
                    <stop offset="1" stop-color="#262626" stop-opacity="0.12" />
                  </linearGradient>
                </defs>
                <g fill="#1E1E1E">
                  <path transform="translate(10 236)"
                    d="M-4.5 .4 C-2.8 -.6 -1.2 -.4 -.2 .5 C1 -1.4 2.6 -3 4.6 -3.9 C3.4 -2 2.6 -.6 1.6 1 C.6 1.5 -.6 1.5 -1.4 1.1 C-2.4 .9 -3.4 .7 -4.5 .4 Z" />
                  <path transform="translate(20 226) scale(.9)"
                    d="M-4.5 .4 C-2.8 -.6 -1.2 -.4 -.2 .5 C1 -1.4 2.6 -3 4.6 -3.9 C3.4 -2 2.6 -.6 1.6 1 C.6 1.5 -.6 1.5 -1.4 1.1 C-2.4 .9 -3.4 .7 -4.5 .4 Z" />
                  <path transform="translate(30 216) scale(.75)"
                    d="M-4.5 .4 C-2.8 -.6 -1.2 -.4 -.2 .5 C1 -1.4 2.6 -3 4.6 -3.9 C3.4 -2 2.6 -.6 1.6 1 C.6 1.5 -.6 1.5 -1.4 1.1 C-2.4 .9 -3.4 .7 -4.5 .4 Z" />
                </g>
                <!-- 山坡 -->
                <path
                  d="M0 293 C5 289 9 286.2 14 286 C19 286 22 289.6 27 289.8 C33 290 38 290.4 42 290 L42 305 C36 301 30 298 23 301 C16 304 8 308 0 311 Z"
                  fill="url(#spine-ink-fade)" />
                <g fill="#262626" opacity="0.45">
                  <circle cx="6" cy="302" r="0.35" />
                  <circle cx="11" cy="304" r="0.3" />
                  <circle cx="17" cy="305.5" r="0.3" />
                  <circle cx="25" cy="303" r="0.35" />
                  <circle cx="31" cy="302.5" r="0.3" />
                  <circle cx="37" cy="301.5" r="0.35" />
                  <circle cx="21" cy="307" r="0.25" />
                  <circle cx="3" cy="306" r="0.3" />
                </g>
                <!-- 亭子 -->
                <g fill="#1E1E1E" stroke="#1E1E1E">
                  <path
                    d="M8.5 281.5 C11 281.2 12.8 279.6 14 277.3 C15.2 279.6 17 281.2 19.5 281.5 C17 281.9 11 281.9 8.5 281.5 Z"
                    stroke="none" />
                  <circle cx="14" cy="276.6" r="0.6" stroke="none" />
                  <path
                    d="M10.5 282.2 L10.5 286.4 M12.6 282.2 L12.6 286.2 M15.4 282.2 L15.4 286.2 M17.5 282.2 L17.5 286.4"
                    stroke-width="0.7" fill="none" />
                </g>
                <!-- 人 -->
                <g fill="#1E1E1E">
                  <circle cx="32" cy="277.6" r="1.5" />
                  <path d="M29.6 280 Q32 278.8 34.4 280 L35 287 L34.4 290 L29.8 290 L29.2 287 Z" />
                </g>
              </g>

              <g v-if="themeOf(index).motif === 'sword'">
                <g transform="translate(21, 284) scale(0.55)">

                  <!-- 1. 红色透视斑驳底盘 -->
                  <g id="ground">
                    <!-- 底部暗部厚度 -->
                    <ellipse cx="0" cy="2.5" rx="58" ry="17" fill="#A82319" />
                    <!-- 主红色台面 -->
                    <ellipse cx="0" cy="0" rx="56" ry="16" fill="#D63F32" />
                    <!-- 边缘朱砂质感碎点斑驳 -->
                    <g fill="#8E170E" opacity="0.4">
                      <ellipse cx="-35" cy="4" rx="10" ry="2.5" />
                      <ellipse cx="30" cy="3" rx="12" ry="3" />
                      <ellipse cx="-8" cy="9" rx="16" ry="3" />
                      <circle cx="-45" cy="-1.5" r="1.2" />
                      <circle cx="46" cy="1" r="1" />
                      <circle cx="-20" cy="11" r="0.8" />
                      <circle cx="16" cy="10" r="1.1" />
                    </g>
                  </g>

                  <!-- 2. 远景：古典废墟拱门与断壁残垣 (版画灰调) -->
                  <g id="ruins" stroke="#33302C" stroke-width="0.7" stroke-linejoin="round" fill="#E6E3DC">
                    <!-- 极左断柱 -->
                    <path d="M-46 1 L-45 -7 L-42 -8 L-41 1 Z" fill="#9C968E" />
                    <path d="M-42 -8 L-41 -12 L-38 -11 L-39 0 Z" fill="#C2BEB6" />

                    <!-- 左侧残破主拱门 -->
                    <path d="M-35 0 L-35 -16 L-32 -16 L-32 0 Z" fill="#7A756D" />
                    <path d="M-26 0 L-26 -16 L-23 -16 L-23 0 Z" fill="#AAA59C" />
                    <path d="M-35 -16 C-35 -24 -23 -24 -23 -16 L-26 -16 C-26 -21 -32 -21 -32 -16 Z" fill="#BDB8AF" />
                    <path d="M-31 -16 C-31 -20 -27 -20 -27 -16" fill="none" stroke="#2B2825" stroke-width="0.6" />

                    <!-- 极右断裂方尖立柱 -->
                    <path d="M41 1 L40 -12 L44 -13 L46 1 Z" fill="#8C877F" />
                    <path d="M42 -13 L43 -16 L44 -13 Z" fill="#BDB8AE" />

                    <!-- 右侧双重罗马主拱门 -->
                    <path d="M18 0 L18 -19 L21 -20 L21 0 Z" fill="#6E6961" />
                    <path d="M29 0 L29 -18 L32 -17 L32 0 Z" fill="#9E9990" />
                    <path d="M17 -19 C17 -30 33 -30 33 -17 L29 -18 C29 -26 21 -26 21 -19 Z" fill="#C9C5BC" />
                    <path d="M19 -19 L21 -19 M29 -18 L31 -18" stroke="#2D2A26" stroke-width="0.9" />
                    <path d="M21 -20 C21 -24 29 -24 29 -18" fill="none" stroke="#2B2825" stroke-width="0.8" />
                  </g>

                  <!-- 3. 中景：立体风化碎石堆 -->
                  <g id="rocks">
                    <!-- 基底大岩石轮廓 -->
                    <polygon points="-34,2 -28,-7 -18,-5 -12,-14 0,-10 14,-13 26,-6 35,2 0,3" fill="#3D3935" />

                    <!-- 岩石亮部切面 -->
                    <polygon points="-28,-7 -21,-13 -14,-9 -18,-5" fill="#D9D5CC" />
                    <polygon points="-12,-14 -6,-20 2,-15 0,-10" fill="#EAE7DF" />
                    <polygon points="2,-15 10,-19 16,-12 14,-13" fill="#D3CFC6" />
                    <polygon points="16,-12 25,-15 28,-7 26,-6" fill="#C2BEB4" />

                    <!-- 岩石阴影面与背光缝隙 -->
                    <polygon points="-21,-13 -12,-14 -18,-5" fill="#66615A" />
                    <polygon points="-6,-20 0,-22 2,-15" fill="#524E48" />
                    <polygon points="10,-19 14,-21 16,-12" fill="#5E5953" />
                    <polygon points="-4,-7 6,-6 11,0 -6,1" fill="#47433D" />

                    <!-- 石材质感勾线 -->
                    <g stroke="#262320" stroke-width="0.5" stroke-linecap="round">
                      <line x1="-10" y1="-12" x2="-6" y2="-8" />
                      <line x1="4" y1="-13" x2="8" y2="-9" />
                      <line x1="18" y1="-10" x2="22" y2="-6" />
                    </g>
                  </g>

                  <!-- 4. 核心：王者之剑 (向左微倾斜 4.5°，剑身高大宽阔) -->
                  <g id="sword" transform="rotate(-4.5, 0, -18)">

                    <!-- 剑刃 (双面立体研磨光影) -->
                    <!-- 左侧亮刃面 -->
                    <path d="M-4.5 -72 L-3.5 -18 L0 -15 L0 -72 Z" fill="#D8D5CC" stroke="#2B2826" stroke-width="0.4" />
                    <!-- 右侧背光暗刃面 -->
                    <path d="M0 -72 L0 -15 L3.5 -18 L4.5 -72 Z" fill="#63605A" stroke="#2B2826" stroke-width="0.4" />
                    <!-- 中央深色血槽 (Fuller) 与反光亮线 -->
                    <line x1="0" y1="-68" x2="0" y2="-22" stroke="#201D1A" stroke-width="0.8" />
                    <line x1="-0.5" y1="-68" x2="-0.5" y2="-22" stroke="#FFFFFF" stroke-width="0.25" opacity="0.6" />
                    <!-- 战斗豁口破损痕迹 -->
                    <path d="M-3.8 -42 L-3.0 -40 L-3.7 -38" fill="#2B2826" />
                    <path d="M4.0 -55 L3.4 -53 L3.9 -51" fill="#2B2826" />

                    <!-- 哥特十字剑格 (宽阔气派的护手) -->
                    <path
                      d="M-14 -72 C-9 -73 -4 -71.5 0 -71.5 C4 -71.5 9 -73 14 -72 C15 -70 13 -68.5 10 -69 C4 -70 2 -69 0 -69 C-2 -69 -4 -70 -10 -69 C-13 -68.5 -15 -70 -14 -72 Z"
                      fill="#3D3935" stroke="#1D1A18" stroke-width="0.5" />
                    <polygon points="0,-73.5 2.5,-70.5 0,-67.5 -2.5,-70.5" fill="#C2BEB4" stroke="#2B2826"
                      stroke-width="0.3" />

                    <!-- 剑柄 (长柄握把与皮革缠绳) -->
                    <rect x="-1.5" y="-86" width="3" height="14" fill="#2A2724" rx="0.5" />
                    <g stroke="#9E998E" stroke-width="0.35">
                      <line x1="-1.5" y1="-83" x2="1.5" y2="-84" />
                      <line x1="-1.5" y1="-79" x2="1.5" y2="-80" />
                      <line x1="-1.5" y1="-75" x2="1.5" y2="-76" />
                    </g>

                    <!-- 剑首 (八面体菱形配重块) -->
                    <polygon points="0,-92 3.2,-88 0,-85.5 -3.2,-88" fill="#423E3A" stroke="#1D1A18"
                      stroke-width="0.5" />
                    <polygon points="0,-91 2,-88 0,-86.5 -2,-88" fill="#C5C0B6" />

                    <!-- 5. 飘带 (系于剑格右侧，随风狂烈翻飞) -->
                    <g id="ribbons">
                      <!-- 主飘带 -->
                      <path d="M1 -70 
                 C8 -72 14 -76 22 -74 
                 C29 -72 34 -81 44 -77 
                 C38 -73 35 -73 28 -70 
                 C21 -67 14 -69 2 -68 Z" fill="#D6382A" stroke="#9E2217" stroke-width="0.3" />
                      <path d="M42 -77 C46 -79 50 -78 54 -81 C48 -77 45 -75 41 -75 Z" fill="#B5281C" />

                      <!-- 副飘带 (低空波浪) -->
                      <path d="M2 -68 
                 C6 -66 11 -68 15 -62 
                 C19 -56 26 -61 34 -58 
                 C29 -56 24 -54 18 -58 
                 C14 -61 8 -62 1 -67 Z" fill="#BF2D20" stroke="#7A150D" stroke-width="0.3" />
                      <path d="M32 -58 C37 -59 42 -56 46 -59 C40 -56 36 -55 31 -56 Z" fill="#911C13" />
                      <ellipse cx="2" cy="-69.5" rx="1.5" ry="2" fill="#75150C" />
                    </g>
                  </g>

                  <!-- 6. 飞鸟点缀 (重现空旷苍茫氛围) -->
                  <g id="birds" fill="none" stroke="#33302C" stroke-width="0.55" stroke-linecap="round">
                    <path d="M-26 -54 Q-24 -56 -22 -54 Q-20 -56 -18 -54" />
                    <path d="M-20 -46 Q-18.5 -47.5 -17 -46 Q-15.5 -47.5 -14 -46" />
                    <path d="M36 -60 Q38 -61.5 40 -60 Q42 -61.5 44 -60" stroke-width="0.45" />
                    <path d="M46 -66 Q47 -67 48 -66 Q49 -67 50 -66" stroke-width="0.35" />
                  </g>

                </g>
              </g>
            </svg>


            <!-- 书名：按插画留白错落排版 -->
            <div class="spine-title-wrap" :class="`motif-${themeOf(index).motif || 'default'}`">
              <span class="spine-title">{{ album.title }}</span>
            </div>


            <!-- 景深阴影遮罩（透明度由 --shade 控制） -->
            <span class="spine-shade"></span>
          </div>

          <!-- 封底：书盒的最后一面。右侧的书转过去后，朝向中间的就是它，
               纸色、颗粒、景深遮罩都与书脊一致。 -->
          <div class="box-back" aria-hidden="true">
            <span class="spine-shade"></span>
          </div>

          <!-- 展开热区：书打开时覆盖整个翻开的范围，避免光标一动就合上。
               只在 is-open 时接收鼠标，平时不会挡住旁边的书。 -->
          <div class="book-hit" @click.stop></div>

          <!-- 正面翻页书体 -->
          <figure class="book">
            <!-- 封面层 -->
            <ul class="hardcover_front">
              <!-- 封面正面 -->
              <li>
                <img :src="album.cover" alt="cover" class="cover-img" @error="onImgError">
                <div class="cover-overlay"></div>
                <div class="vertical-title">
                  <span v-for="(part, i) in splitIntoColumns(album.title, 2)" :key="i" class="title-column">
                    {{ part }}
                  </span>
                </div>
                <span class="cover-shade"></span>
              </li>
              <!-- 翻开后的左扉页 -->
              <li>
                <div class="mini-photos-wrapper">
                  <div v-for="(photo, pIdx) in getPagePhotos(album.photos, 0)" :key="pIdx" class="mini-polaroid">
                    <div class="mini-img-box">
                      <img :src="getPhotoSrc(photo)" class="mini-img" decoding="async" />
                    </div>
                    <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                  </div>
                </div>
              </li>
            </ul>

            <!-- 内页 -->
            <ul class="page">
              <li v-for="pageIndex in 5" :key="pageIndex">
                <div class="mini-photos-wrapper">
                  <div v-for="(photo, pIdx) in getPagePhotos(album.photos, pageIndex)" :key="pIdx"
                    class="mini-polaroid">
                    <div class="mini-img-box">
                      <img :src="getPhotoSrc(photo)" class="mini-img" decoding="async" />
                    </div>
                    <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </figure>

          <!-- 底部接触投影 -->
          <div class="box-shadow"></div>
        </div>
      </div>
    </div>

    <!-- 底部信息控制器 -->
    <div class="shelf-controls" v-if="currentAlbum">
      <button class="vasari-arrow" @click.stop="prevAlbum" title="上一个">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M6 1L1 6l5 5M1 6h23" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="active-album-meta" @click.stop="$emit('select-album', currentAlbum)">
        <h2 class="meta-title">{{ currentAlbum.title }}</h2>
        <h2 class="meta-num">{{ currentCount }}张</h2>
      </div>

      <button class="vasari-arrow" @click.stop="nextAlbum" title="下一个">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M18 1l5 5-5 5M23 6H0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  albums: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['select-album']);

//  状态 
let currentS = 0;
let openT = 0;   // 0 合上 → 1 完全展开，平滑过渡，用来给两侧的书让位

const targetT = ref(0);
const activeIndex = ref(0);
const hoveredIndex = ref(-1);
const isDragging = ref(false);

// 展开状态：书停稳、没在拖拽、光标在当前书上 → 打开
const settled = ref(true);
const isOpen = computed(() => settled.value && hoveredIndex.value === activeIndex.value);

const spineThemes = {
  custom: { paper: '#F2F3F6', ink: '#2F3F63', motif: 'hand' },
  persons: { paper: '#F6F1EF', ink: '#3B2F2E', motif: 'swing' },
  views: { paper: '#F1F2EE', ink: '#2C372F', motif: 'lake' },
  holiday: { paper: '#F8F6F0', ink: '#262626', motif: 'ink' },
  game: { paper: '#F4F2ED', ink: '#2D2A26', motif: 'sword' },
};
// 新增相册没配主题时用这个：素纸 + 无插画
const fallbackTheme = { paper: '#F8F6F0', ink: '#2B2724', motif: null };

function themeOf(index) {
  const album = props.albums[index];
  return (album && spineThemes[album.id]) || fallbackTheme;
}


const currentCount = computed(() => {
  const photos = currentAlbum.value?.photos;
  return Array.isArray(photos) ? photos.length : 0;
});

const currentAlbum = computed(() => props.albums[activeIndex.value] || null);

const config = ref({
  H: 330,
  d: 196,
  ws: 42,
  gap: 38,   
  U: 780,   
  P: 1400,
  og: 62,   
});

const updateConfig = () => {
  const isMobile = window.innerWidth <= 768;
  config.value = {
    H: isMobile ? 240 : 330,
    d: isMobile ? 148 : 196,
    ws: isMobile ? 32 : 42,
    gap: isMobile ? 20 : 38,
    U: isMobile ? 440 : 780, 
    P: 1400,
    og: isMobile ? 36 : 62,
  };
};

function smoothstep(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function B(r) {
  if (Math.abs(r) < 1) {
    return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
  }
  return r >= 1 ? 0.5 : -0.5;
}

// 书脊可见度（正视时平滑隐于封面背后，绝无破面）
const spineOpacity = (absR) => {
  if (absR < 0.08) return 0;
  if (absR < 0.35) return (absR - 0.08) / 0.27;
  return 1;
};

// ==================== 直接写 DOM 的布局 ====================
// 每帧只改 transform / z-index 和两个 CSS 变量（--shade、--spine-o），
// 不走 Vue 渲染，也不会重新 diff 那几十张图片和 SVG
const slotEls = [];
const lifts = [];   // 侧面书被悬停时的上抬量（px，带缓动）
const setSlotRef = (el, i) => { slotEls[i] = el || null; };

function applyLayout() {
  const { ws, d, gap, U, P, H, og } = config.value;

  for (let i = 0; i < props.albums.length; i++) {
    const el = slotEls[i];
    if (!el) continue;

    const r = i - currentS;
    const absR = Math.abs(r);
    const o = smoothstep(1 - absR);

    // ★ 关键修复：外侧书采用渐进级数补偿（多叠一本，多以 1.25 次方外推抵消透视压缩）
    const extraSteps = Math.max(0, absR - 1);
    const progressive = extraSteps > 0 ? (extraSteps * og + Math.pow(extraSteps, 1.25) * 18) : 0;
    const outer = Math.sign(r) * progressive;

    const u = r * (ws + gap) + (d - ws + 2.2 * gap) * B(r) + outer;
    const sc = 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
    const k = 1 / sc;

    // 展开让位逻辑保持不变
    let shift = 0;
    if (openT > 0.001) {
      const f = d / 196;
      const s = Math.max(-1, Math.min(1, r * 2));
      const mid = 78 * f, left = -125 * f, right = 62 * f;
      const target = s < 0 ? mid + (left - mid) * -s : mid + (right - mid) * s;
      shift = openT * target;
    }

    const x = u + shift;
    const z = P * (1 - k) + o * 75;
    const y = H * 0.42 * (1 - sc) * 0.36 - (lifts[i] || 0);

    // ★ 关键优化：左侧书角度微调为 81deg（原来84deg偏平，81deg让书脊更清晰面对视线且避免封皮外突挡书）
    const leftAngle = 81;
    const rightAngle = 96;
    const rotateY = (1 - o) * (r < 0 ? leftAngle : rightAngle);

    el.style.transform =
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg)`;
    el.style.zIndex = Math.round(2000 + z + o * 100);
    el.style.setProperty('--shade', ((1 - o) * 0.2).toFixed(3));
    el.style.setProperty('--spine-o', spineOpacity(absR).toFixed(3));
  }
}

//  动画循环 
let animId = 0;
let lastTime = 0;

const kick = () => {
  if (animId) return;
  lastTime = performance.now();
  animId = requestAnimationFrame(tick);
};

function tick(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  let busy = isDragging.value;

  // 位置：足够接近就直接吸附，不再指数拖尾（之前要拖约 5 秒才真正停下）
  const diff = targetT.value - currentS;
  if (Math.abs(diff) < 0.0008) {
    currentS = targetT.value;
  } else {
    currentS += diff * (1 - Math.exp(-(isDragging.value ? 20 : 7.2) * dt));
    busy = true;
  }

  const nearest = Math.max(0, Math.min(props.albums.length - 1, Math.round(currentS)));
  if (nearest !== activeIndex.value) {
    activeIndex.value = nearest;
  }

  // 书还在滑动 / 正在拖拽时不展开，避免滑过的书被误触发
  const nowSettled = !isDragging.value && Math.abs(targetT.value - currentS) < 0.03;
  if (nowSettled !== settled.value) settled.value = nowSettled;

  // 展开进度
  const openGoal = isOpen.value ? 1 : 0;
  if (openT !== openGoal) {
    openT += (openGoal - openT) * (1 - Math.exp(-5.5 * dt));
    if (Math.abs(openGoal - openT) < 0.001) openT = openGoal;
    else busy = true;
  }

  // 侧面书被悬停时微微抬起
  for (let i = 0; i < props.albums.length; i++) {
    const goal = hoveredIndex.value === i && Math.abs(i - currentS) > 0.4 ? 22 : 0;
    const cur = lifts[i] || 0;
    if (Math.abs(goal - cur) > 0.05) {
      lifts[i] = cur + (goal - cur) * (1 - Math.exp(-14 * dt));
      busy = true;
    } else {
      lifts[i] = goal;
    }
  }

  applyLayout();
  animId = busy ? requestAnimationFrame(tick) : 0;
}

// 任何会影响动画的状态一变，就唤醒循环
watch([targetT, isDragging, hoveredIndex, isOpen], kick);

// ==================== 拖拽与点击手势 ====================
const dragStartX = ref(0);
const dragStartT = ref(0);
const pointerMovedDistance = ref(0);

const onPointerDown = (e) => {
  if (e.target.closest('.shelf-controls')) return;
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartT.value = targetT.value;
  pointerMovedDistance.value = 0;
};

const onPointerMove = (e) => {
  if (!isDragging.value) return;
  const dx = e.clientX - dragStartX.value;
  pointerMovedDistance.value = Math.abs(dx);

  const unit = config.value.ws + config.value.gap;
  const nextT = dragStartT.value - dx / unit;
  targetT.value = Math.max(-0.35, Math.min(props.albums.length - 0.65, nextT));
};

const onPointerUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  targetT.value = Math.max(0, Math.min(props.albums.length - 1, Math.round(targetT.value)));
};

const onBookClick = (album, index) => {
  if (pointerMovedDistance.value > 6) return;
  if (index === activeIndex.value) {
    emit('select-album', album);
  } else {
    targetT.value = index;
  }
};

let wheelTimer = null;
const onWheel = (e) => {
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const unit = config.value.ws + config.value.gap;
  targetT.value = Math.max(0, Math.min(props.albums.length - 1, targetT.value + (delta / unit) * 0.45));

  if (wheelTimer) clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    targetT.value = Math.round(targetT.value);
    wheelTimer = null;
  }, 140);
};

const prevAlbum = () => {
  targetT.value = Math.max(0, Math.round(targetT.value) - 1);
};

const nextAlbum = () => {
  targetT.value = Math.min(props.albums.length - 1, Math.round(targetT.value) + 1);
};

const onKeyDown = (e) => {
  if (e.key === 'ArrowLeft') prevAlbum();
  if (e.key === 'ArrowRight') nextAlbum();
  if (e.key === 'Enter' && currentAlbum.value) {
    emit('select-album', currentAlbum.value);
  }
};

//  初始化 / 生命周期 
function resetToCenter() {
  const n = props.albums.length;
  if (!n) return;
  const mid = Math.floor(n / 2);
  activeIndex.value = mid;
  targetT.value = mid;
  currentS = mid;
  lifts.length = 0;
}
resetToCenter();

// 空闲时把展开会用到的照片逐张预解码，
// 避免书滑到中心那一刻才解码十几张图造成卡顿
function warmPhotos() {
  const srcs = props.albums
    .flatMap((a) => (a.photos || []).slice(0, 12).map(getPhotoSrc))
    .filter(Boolean);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
  const next = () => {
    const src = srcs.shift();
    if (!src) return;
    const im = new Image();
    im.src = src;
    (im.decode ? im.decode() : Promise.resolve()).catch(() => { }).finally(() => idle(next));
  };
  idle(next);
}

const onResize = () => {
  updateConfig();
  applyLayout();
};

watch(() => props.albums, () => {
  resetToCenter();
  nextTick(applyLayout);
});

onMounted(() => {
  updateConfig();
  applyLayout();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  warmPhotos();
});

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId);
  animId = 0;
  if (wheelTimer) clearTimeout(wheelTimer);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', onResize);
});

// ==================== 工具函数 ====================
function splitIntoColumns(str, colSize = 2) {
  if (!str) return [];
  const res = [];
  for (let i = 0; i < str.length; i += colSize) {
    res.push(str.slice(i, i + colSize));
  }
  return res;
}

function getPagePhotos(photos = [], pageIndex = 0) {
  if (!photos) return [];
  return photos.slice(pageIndex * 2, pageIndex * 2 + 2);
}

function getPhotoSrc(photo) {
  if (!photo) return '';
  return photo.thumb || photo.cover || photo.url || '';   // 数据里有缩略图字段就优先用
}

function onImgError(e) {
  e.target.style.opacity = '0';
}
</script>

<style scoped>
.vasari-shelf-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  user-select: none;
  touch-action: pan-y;
  perspective: 1400px;
  perspective-origin: 50% 48%;
  box-sizing: border-box;
  padding-top: 20px;
}

/* 地面漫反射环境光阴影 */
.shelf-ground-shadow {
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(94vw, 1100px);
  height: 150px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(32, 24, 16, 0.22) 0%, rgba(32, 24, 16, 0.05) 55%, transparent 75%);
  filter: blur(16px);
  pointer-events: none;
  z-index: 0;
}

/* 3D 舞台中心 */
.shelf-stage {
  position: relative;
  width: 0;
  height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
}

.book-slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
}

/* 3D 实体书盒 */
.book-box {
  position: absolute;
  top: -165px;
  left: -98px;
  width: 196px;
  height: 330px;
  transform-style: preserve-3d;

  --depth: 42px;
  /* 书的厚度 = 书脊宽度 */
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.1'/%3E%3C/svg%3E");

  /* 以厚度中心为转轴：封面在前 +depth/2，封底在后 -depth/2。
     左右两侧的书转过去时对称，不再整体偏向一边 */
  transform: translateZ(calc(var(--depth) / -2));
}

/* ========================================================
   ★ 书脊样式 ★
   纸色 --paper、墨色 --ink 由 JS 里的 spineThemes 按封面注入
   透明度 --spine-o 由动画循环直接写入
   ======================================================== */
.box-spine {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--depth) + 2px);
  /* 书脊厚度（宽）；多出的 2px 用来接住封面，避免白缝 */
  height: 100%;
  box-sizing: border-box;
  background-color: var(--paper, #F4F2ED);
  /* 纸张颗粒：和页面背景同一套噪点，让书脊像同一批纸 */
  background-image: var(--grain);

  /* 3D 空间翻折：从书盒左缘向前（+z）伸出 depth，正好接住封面和封底 */
  transform-origin: 0% 50%;
  transform: rotateY(-90deg);
  backface-visibility: hidden;
  opacity: var(--spine-o, 1);

  box-shadow:
    inset 0 0 0 1px rgba(30, 26, 22, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-radius: 2px 0 0 2px;
  overflow: hidden;
}

/* 中间那本书的书脊在封面背后，不接收鼠标 */
.book-slot.is-center .box-spine {
  pointer-events: none;
}

/* 硬壳书的"书槽"：靠近封面和封底各压一道细凹痕，再加上下两端的收边，
   这是书脊立体感最关键的两个细节 */
.box-spine::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 19;
  pointer-events: none;
  background:
    linear-gradient(90deg,
      transparent 0 9%,
      rgba(0, 0, 0, 0.20) 9% 11%,
      rgba(255, 255, 255, 0.55) 11% 13%,
      transparent 13% 87%,
      rgba(0, 0, 0, 0.20) 87% 89%,
      rgba(255, 255, 255, 0.55) 89% 91%,
      transparent 91%),
    linear-gradient(180deg,
      rgba(0, 0, 0, 0.18) 0%,
      transparent 2.5%,
      transparent 97.5%,
      rgba(0, 0, 0, 0.18) 100%);
}

/* 纸盒转折处的明暗：盖在插画之上，让画面也随着书脊的圆角受光 */
.box-spine::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.20) 0%,
      rgba(0, 0, 0, 0.06) 9%,
      rgba(255, 255, 255, 0.18) 24%,
      rgba(255, 255, 255, 0.04) 42%,
      rgba(0, 0, 0, 0.03) 66%,
      rgba(0, 0, 0, 0.12) 88%,
      rgba(0, 0, 0, 0.22) 100%);
}

/* ==================== 封底 ====================
   位于书盒最后一面（z = 0），面朝后方。与书脊同纸色、同颗粒、同遮罩。 */
.box-back {
  position: absolute;
  inset: 0;
  background-color: var(--theme-color, #F4F2ED);
  background-image: var(--grain);
  transform: rotateY(180deg);
  backface-visibility: hidden;
  border-radius: 4px 2px 2px 4px;
  box-shadow: inset 0 0 0 1px rgba(30, 26, 22, 0.28);
  overflow: hidden;
}

/* 靠书脊一侧压暗，和书脊的转折自然衔接。
   封底整体 rotateY(180°) 翻了面，书脊侧在元素自身坐标里是右边 */
.box-back::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08), transparent 14%, transparent 86%, rgba(0, 0, 0, 0.22));
}

/* ==================== 展开热区 ==================
   覆盖"合上的书 + 向左甩开的封面"。平时不接收鼠标，只在展开时生效 */
.book-hit {
  position: absolute;
  top: -8%;
  bottom: -8%;
  left: -115%;
  right: -5%;
  pointer-events: none;
}

.book-slot.is-open .book-hit {
  pointer-events: auto;
}

/* 插画层：铺满整条书脊 */
.spine-art {
  color: var(--ink);
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/*  竖排书名自适应排版  */
.spine-title-wrap {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* 1. 动漫 (hand)：图在顶端，文字优雅落于中下部 */
.spine-title-wrap.motif-hand {
  top: 44%;
  bottom: 18%;
}

/* 2. 人物 (swing)：秋千长绳贯穿整本，文字稳落于最底部 */
.spine-title-wrap.motif-swing {
  top: 72%;
  bottom: 6%;
}
.spine-title-wrap.motif-swing .spine-title {
  font-size: 16px;
  letter-spacing: 0.22em;
}

/* 3. 风光 (lake)：雪山天池在上方，文字沉着排在湖泊下方 */
.spine-title-wrap.motif-lake {
  top: 48%;
  bottom: 16%;
}

/* 4. 水墨 (ink)：大地与亭台在下，文字飘逸在天空上方 (国画题跋) */
.spine-title-wrap.motif-ink {
  top: 14%;
  bottom: 44%;
}

/* 5. 游戏 (sword)：王者之剑拔地而起，文字高悬于极顶 (庄严铭文) */
.spine-title-wrap.motif-sword {
  top: 8%;
  bottom: 52%;
}

/* 默认兜底 */
.spine-title-wrap.motif-default {
  top: 20%;
  bottom: 35%;
}

.spine-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: var(--ink);
  line-height: 1;
}


/* 景深遮罩：透明度由动画循环写在 .book-slot 上的 --shade 控制 */
.spine-shade,
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 25;
  background: #0E0C0A;
  opacity: var(--shade, 0);
  pointer-events: none;
}

/* 落地阴影：不再动画 width/height，也去掉了 blur，避免每次状态变化都重新光栅化 */
.box-shadow {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 88%;
  height: 20px;
  background: radial-gradient(ellipse at center,
      rgba(40, 28, 16, 0.42) 0%,
      rgba(40, 28, 16, 0.16) 45%,
      transparent 72%);
  pointer-events: none;
  transition: transform 0.3s ease;
}

.book-slot.is-center .box-shadow {
  transform: translateX(-50%) scale(1.23, 1.3);
}

/*  翻页书模型本体  */
.book {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  margin: 0;
}

/*  关键修复：当相册在侧面时，隐藏内页防止露肚皮，居中时完全正常展开。
   用 visibility 而不是 display:none，换中心时不会触发整棵树重排 */
.book-slot.is-side .book {
  backface-visibility: hidden;
}

.book-slot.is-side .page {
  visibility: hidden;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hardcover_front li:first-child {
  background: var(--theme-color, #F4F2ED);
  backface-visibility: hidden;
  position: relative;
  overflow: hidden;
  border-radius: 2px 4px 4px 2px;
  box-shadow: inset 0 0 0 1px rgba(30, 22, 14, 0.35);
}

.cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(20, 14, 8, 0.22), transparent 10%),
    linear-gradient(0deg, rgba(20, 14, 8, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.15), transparent 25%);
}

.hardcover_front li:last-child {
  background: #FAF7F2;
}

.page>li {
  background: linear-gradient(to right, #ded8d0 0%, #fffdf8 100%);
  box-shadow: inset 0px -1px 2px rgba(50, 50, 50, 0.1),
    inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 4px 4px 0px;
}

.hardcover_front,
.hardcover_front li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.hardcover_front {
  transform-origin: 0 50%;
  /* 封面在书盒最前面（z = depth）；先平移再旋转，铰链就落在封面与书脊相接的前左角 */
  transform: translateZ(var(--depth));
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0.6s;
  z-index: 100;
}

.hardcover_front li:first-child {
  transform: translateZ(2px);
}

.hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(2px);
}

/*  悬停翻页动效  */
.page,
.page>li {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
}

.page {
  width: 100%;
  height: 98%;
  top: 1%;
  left: 3%;
  z-index: 50;
  /* 内页紧贴在封面背后 */
  transform: translateZ(calc(var(--depth) - 6px));
}

.page>li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 6px;
  box-sizing: border-box;
}

.page>li:nth-child(1) {
  transition-duration: 0.6s;
}

.page>li:nth-child(2) {
  transition-duration: 0.6s;
}

.page>li:nth-child(3) {
  transition-duration: 0.4s;
}

.page>li:nth-child(4) {
  transition-duration: 0.5s;
}

.page>li:nth-child(5) {
  transition-duration: 0.6s;
}

/* 展开由 JS 的 isOpen 控制（书停稳 + 光标在书上），
   这样两侧的书才能和它同步让位 */
.book-slot.is-open .book>.hardcover_front {
  transform: translateZ(var(--depth)) rotateY(-145deg);
  z-index: 0;
}

.book-slot.is-open .book>.page li:nth-child(1) {
  transform: rotateY(-30deg);
  transition-duration: 1.5s;
}

.book-slot.is-open .book>.page li:nth-child(2) {
  transform: rotateY(-35deg);
  transition-duration: 1.8s;
}

.book-slot.is-open .book>.page li:nth-child(3) {
  transform: rotateY(-118deg);
  transition-duration: 1.6s;
}

.book-slot.is-open .book>.page li:nth-child(4) {
  transform: rotateY(-130deg);
  transition-duration: 1.4s;
}

.book-slot.is-open .book>.page li:nth-child(5) {
  transform: rotateY(-140deg);
  transition-duration: 1.2s;
}

.mini-photos-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.book-slot.is-open .mini-photos-wrapper {
  opacity: 1;
  transition-delay: 0.15s;
}

.mini-polaroid {
  width: 118px;
  background: #ffffff;
  padding: 4px 4px 6px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.mini-polaroid:nth-child(1) {
  transform: rotate(-1.5deg);
}

.mini-polaroid:nth-child(2) {
  transform: rotate(1.5deg);
}

.mini-img-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 2px;
  overflow: hidden;
  background: #edeae3;
}

.mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-title {
  font-size: 8px;
  color: #555;
  margin-top: 3px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 102px;
}

.vertical-title {
  position: absolute;
  top: 26px;
  left: 26px;
  z-index: 10;
  display: flex;
  gap: 4px;
  pointer-events: none;
}

.title-column {
  display: inline-block;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #2D2721;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

/*  底部信息栏与控制器  */
.shelf-controls {
  position: absolute;
  bottom: 46px;
  display: flex;
  align-items: center;
  gap: 36px;
  z-index: 30;
  pointer-events: auto;
}

.vasari-arrow {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #1F3FB0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease;
  opacity: 0.85;
}

.vasari-arrow:hover {
  opacity: 1;
  transform: scale(1.18);
}

.vasari-arrow:active {
  transform: scale(0.92);
}

.active-album-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.active-album-meta:hover {
  transform: translateY(-2px);
}


.meta-title {
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 32px;
  font-weight: 700;
  color: #0F64B5;
  margin: 3px 0;
  letter-spacing: 0.08em;
  line-height: 1.1;
}

.active-album-meta:hover .meta-title {
  color: #0B4F8F;
}

.meta-num {
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(30, 51, 70, 0.62);
  margin: 0;
  letter-spacing: 0.18em;
  line-height: 1;
}

.vasari-arrow {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(30, 51, 70, 0.85);
  /* 默认蓝墨，不抢标题 */
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.25s ease,
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.vasari-arrow:hover {
  color: #0F64B5;
  /* 悬停才亮蓝 */
  transform: scale(1.18);
}

.vasari-arrow:active {
  transform: scale(0.92);
}

/* 键盘焦点环，跟品牌蓝统一 */
.vasari-arrow:focus-visible,
.active-album-meta:focus-visible {
  outline: 2px solid #0F64B5;
  outline-offset: 3px;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .vasari-shelf-container {
    perspective-origin: 50% 45%;
  }

  .book-box {
    top: -120px;
    left: -74px;
    width: 148px;
    height: 240px;
    --depth: 32px;
  }

  .spine-title {
    font-size: 13px;
    letter-spacing: 0.18em;
  }
  .spine-title-wrap.motif-swing .spine-title {
    font-size: 12px;
    letter-spacing: 0.15em;
  }

  .vertical-title {
    top: 16px;
    left: 16px;
  }

  .title-column {
    font-size: 15px;
    letter-spacing: 3px;
  }

  .mini-polaroid {
    width: 88px;
  }

  .shelf-controls {
    bottom: 26px;
    gap: 16px;
  }

  .meta-title {
    font-size: 24px;
  }
}
</style>