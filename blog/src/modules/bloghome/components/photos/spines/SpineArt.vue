<template>
  <svg
    class="spine-art"
    viewBox="0 0 42 330"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <!--  动漫 -->
    <g v-if="motif === 'hand'">
      <ellipse cx="21" cy="270" rx="17" ry="8.5" fill="#6B7FA8" />
      <ellipse cx="17" cy="272" rx="9" ry="4" fill="#5E7298" opacity="0.45" />
      <path d="M20.2 278 L20.8 256 L26.2 256 L26.4 277.6 Z" fill="#EDAA8F" />
      <path d="M20.6 257 C19 253 18.8 249.5 20 247.5 L26 246.5 C27.4 249.5 27 254 26.2 257 Z" fill="#EDAA8F" />
      <g stroke="#EDAA8F" stroke-width="1.9" stroke-linecap="round" fill="none">
        <path d="M20.4 249 L14.8 244.5" />
        <path d="M21.2 247.6 L16.4 240" />
        <path d="M22.8 246.8 L19.4 237.6" />
        <path d="M24.6 246.6 L23.4 238.4" />
        <path d="M26 253 L28.6 246.2" />
      </g>
    </g>

    <!-- 两个坐在超长秋千上的孩子 -->
    <g v-if="motif === 'swing'" stroke-linecap="round" stroke-linejoin="round">
      <!-- 超长秋千长绳 -->
      <g stroke="#3A3733" stroke-width="0.38" fill="none" opacity="0.85">
        <!-- 男孩秋千绳 -->
        <path d="M 11.2 0 C 11.6 70, 11.0 145, 11.4 214" />
        <path d="M 12.1 0 C 12.5 70, 11.9 145, 12.3 214" />
        <path d="M 16.6 0 C 16.3 70, 16.8 145, 16.5 214" />
        <path d="M 17.5 0 C 17.2 70, 17.7 145, 17.4 214" />
        <!-- 女孩秋千绳 -->
        <path d="M 24.8 0 C 24.5 70, 24.9 140, 24.6 206" />
        <path d="M 25.6 0 C 25.3 70, 25.7 140, 25.4 206" />
        <path d="M 29.3 0 C 29.5 70, 29.2 140, 29.4 206" />
        <path d="M 30.2 0 C 30.4 70, 30.1 140, 30.3 206" />
      </g>

      <!-- 男孩 -->
      <g id="boy">
        <path d="M 10.2 214.2 C 13.5 215.2, 16 215.2, 18.5 214" stroke="#2B2825" stroke-width="0.8" fill="none" />
        <path d="M 11.4 214.5 L 11.2 217.5 M 17.4 214.5 L 17.6 217.5" stroke="#3A3733" stroke-width="0.4" />

        <g fill="#2B2825" stroke="#2B2825" stroke-width="0.3">
          <path d="M 12.2 211 L 16.5 211.5 L 16.8 216 L 12.2 215.5 Z" />
          <path d="M 12.4 215.5 L 12.2 222.5 L 11.4 224 L 13.4 224 L 13.5 215.8 Z" />
          <path d="M 15.0 216 L 15.3 223 L 14.5 224.5 L 16.5 224.5 L 16.2 216 Z" />
        </g>

        <path d="M 12.6 201
                 C 14.2 201.5, 15.6 202, 16.2 203
                 L 15.5 211.8
                 C 14.2 211.5, 13.0 211.2, 12.0 210.8 Z"
              fill="#FAF9F5" stroke="#2B2825" stroke-width="0.6" />

        <path d="M 13.2 196.5
                 C 12.2 196.5, 11.5 197.8, 11.6 199.5
                 C 11.7 200.5, 12.5 201.2, 13.8 201
                 C 14.8 200.8, 15.2 199.5, 15.0 198
                 C 14.8 196.8, 14.2 196.5, 13.2 196.5 Z"
              fill="#242220" />
        <path d="M 14.2 198.5 C 14.8 199, 14.8 199.8, 14.2 200.5"
              stroke="#2B2825" stroke-width="0.4" fill="none" />

        <path d="M 12.8 203 C 12.2 205, 11.6 207, 11.6 209"
              stroke="#2B2825" stroke-width="0.65" fill="none" />
        <path d="M 15.6 203.2
                 C 17.2 203.5, 18.8 203.8, 20.4 204.0"
              stroke="#2B2825" stroke-width="0.68" fill="none" />
        <circle cx="20.6" cy="204.0" r="0.3" fill="#2B2825" />
      </g>

      <!-- 女孩 -->
      <g id="girl">
        <path d="M 23.8 206.2 C 26.8 207.2, 29.2 207.2, 31.4 206" stroke="#2B2825" stroke-width="0.8" fill="none" />
        <path d="M 25.4 206.5 L 25.2 209.5 M 30.3 206.5 L 30.5 209.5" stroke="#3A3733" stroke-width="0.4" />

        <g fill="#2B2825" stroke="#2B2825" stroke-width="0.3">
          <path d="M 25.2 204.5 L 28.5 205.5 L 28.0 210 L 24.8 209 Z" />
          <path d="M 25.6 209.5 C 26.2 212.5, 27.2 215, 27.8 217.5 L 26.8 218 L 24.8 211 Z" />
          <circle cx="27.6" cy="218.2" r="0.6" />
        </g>

        <ellipse cx="28.8" cy="204.8" rx="1.2" ry="1.6" fill="#D3CEBE" stroke="#2B2825" stroke-width="0.35" />
        <path d="M 26.4 198.5 L 28.2 204" stroke="#2B2825" stroke-width="0.3" fill="none" />

        <path d="M 27.8 197.5
                 C 26.5 197.8, 25.2 199.2, 24.8 201
                 L 25.4 205.5
                 C 26.8 205.8, 28.2 205.5, 29.2 204.5 Z"
              fill="#FAF9F5" stroke="#2B2825" stroke-width="0.6" />

        <path d="M 26.2 195.2
                 C 27.5 194.8, 29.5 195.0, 31.5 196.2
                 C 30.5 197.2, 28.5 197.8, 26.8 198.2 Z"
              fill="#242220" />
        <circle cx="26.0" cy="196.5" r="1.2" fill="#242220" />
        <path d="M 25.2 196.2 C 24.8 196.8, 24.8 197.5, 25.4 198"
              stroke="#2B2825" stroke-width="0.4" fill="none" />

        <path d="M 28.2 199 C 29.2 201, 29.8 202.5, 30.2 204"
              stroke="#2B2825" stroke-width="0.6" fill="none" />
        <path d="M 25.0 199.2
                 C 23.8 200.5, 22.6 202.0, 21.6 203.2"
              stroke="#2B2825" stroke-width="0.68" fill="none" />
        <circle cx="21.4" cy="203.4" r="0.3" fill="#2B2825" />
      </g>
    </g>

    <!-- 赛里木湖雪山湖水 -->
    <g v-if="motif === 'lake'">
      <g transform="translate(21, 275) scale(0.48)">
        <defs>
          <linearGradient id="sylWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1B5B9E" />
            <stop offset="35%" stop-color="#216DB5" />
            <stop offset="100%" stop-color="#195493" />
          </linearGradient>
        </defs>

        <!-- 远景雪山 -->
        <g id="snow-mountains">
          <path d="M -54 2
                   C -50 -1, -44 -4, -38 -5
                   C -35 -9, -32 -13, -27 -14
                   C -23 -11, -19 -16, -15 -18
                   C -11 -13, -6 -20, -2 -21
                   C 3 -19, 7 -21, 12 -18
                   C 16 -14, 20 -17, 24 -15
                   C 30 -11, 35 -13, 40 -8
                   C 45 -5, 50 -1, 54 2 Z"
                fill="#383531" />
          <path d="M -44 -4 C -40 -3, -37 -8, -32 -8 L -27 -14 L -21 -10 L -15 -18 L -9 -12 L -2 -21 L 5 -15 L 12 -18 L 19 -11 L 24 -15 L 32 -9 L 40 -8 L 47 -2 L 53 2 L -52 2 Z"
                fill="#6B665E" opacity="0.6" />
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
                   C -34 -6, -40 -3, -46 0 Z"
                fill="#F6F7F9" />
          <g stroke="#262320" stroke-width="0.5" stroke-linecap="round" opacity="0.75">
            <path d="M -27 -14 Q -25 -8 -23 -2" />
            <path d="M -15 -18 Q -13 -10 -10 -2" />
            <path d="M -2 -21 Q 0 -11 2 -2" />
            <path d="M 12 -18 Q 14 -10 16 -1" />
            <path d="M 24 -15 Q 26 -8 28 -1" />
          </g>
        </g>

        <!-- 湖畔滩涂 -->
        <g id="shoreline">
          <path d="M -54 2 C -30 0, 20 0, 54 2 L 53 4 C 20 2.5, -30 2.5, -53 4 Z" fill="#524D46" />
          <path d="M -53 3
                   C -46 3, -36 4, -28 5
                   C -24 5.5, -20 6.5, -16 6.8
                   C -21 7.5, -28 7, -35 6.5
                   C -42 6, -48 5, -52 4.5 Z"
                fill="#443F38" />
          <path d="M -48 3.5 C -36 4.5, -26 5.8, -16 6.8"
                stroke="#E5E7EB" stroke-width="0.35" fill="none" opacity="0.8" />
        </g>

        <!-- 湖体 -->
        <g id="lake-basin">
          <path d="M -50 4
                   C -36 2, -10 1.5, 0 1.5
                   C 18 1.5, 38 2.2, 50 4
                   C 53 5.5, 52 8, 48 11
                   C 43 14.5, 39 16.5, 32 19
                   C 24 22, 14 23.8, 2 24.2
                   C -10 24.5, -22 23.5, -32 20.5
                   C -40 18, -46 15, -49 11.5
                   C -52 8, -52 5.5, -50 4 Z"
                fill="url(#sylWaterGrad)" />
          <path d="M -46 13
                   C -38 18, -26 22, -12 23.5
                   C 5 24.5, 20 23, 34 18.5
                   C 41 16, 45 13, 47 11.5
                   C 43 15, 38 17.5, 30 20
                   C 18 23.5, 0 24.8, -14 24
                   C -28 23, -39 19, -46 13 Z"
                fill="#124375" opacity="0.4" />
          <g stroke="#8EC1ED" stroke-width="0.3" stroke-linecap="round" opacity="0.45">
            <line x1="-25" y1="11" x2="-14" y2="11" />
            <line x1="8" y1="9" x2="22" y2="9" />
            <line x1="-8" y1="15" x2="6" y2="15" />
            <line x1="16" y1="16" x2="28" y2="16" />
            <line x1="-20" y1="18" x2="-6" y2="18" />
            <line x1="4" y1="20" x2="15" y2="20" />
          </g>
        </g>

        <!-- 画报文字 -->
        <g id="typography" fill="#2E2B27" text-anchor="middle"
           font-family="'Times New Roman', Georgia, serif">
          <text x="0" y="-30" font-size="3.2" letter-spacing="10" opacity="0.85">SYL</text>
          <text x="0" y="-26" font-size="1.4" letter-spacing="0.8" opacity="0.55">SAYRAM</text>
          <text x="0" y="-24" font-size="1.1" letter-spacing="0.6" opacity="0.45">HIGH WATER · WEST WIND</text>
          <text x="0" y="30" font-size="1.5" letter-spacing="1.2" opacity="0.65">THE LAKE HOLDS THE SKY</text>
        </g>
      </g>
    </g>

    <!--  水墨亭台山坡 -->
    <g v-if="motif === 'ink'">
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
      <path d="M0 293 C5 289 9 286.2 14 286 C19 286 22 289.6 27 289.8 C33 290 38 290.4 42 290 L42 305 C36 301 30 298 23 301 C16 304 8 308 0 311 Z"
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
      <g fill="#1E1E1E" stroke="#1E1E1E">
        <path d="M8.5 281.5 C11 281.2 12.8 279.6 14 277.3 C15.2 279.6 17 281.2 19.5 281.5 C17 281.9 11 281.9 8.5 281.5 Z"
              stroke="none" />
        <circle cx="14" cy="276.6" r="0.6" stroke="none" />
        <path d="M10.5 282.2 L10.5 286.4 M12.6 282.2 L12.6 286.2 M15.4 282.2 L15.4 286.2 M17.5 282.2 L17.5 286.4"
              stroke-width="0.7" fill="none" />
      </g>
      <g fill="#1E1E1E">
        <circle cx="32" cy="277.6" r="1.5" />
        <path d="M29.6 280 Q32 278.8 34.4 280 L35 287 L34.4 290 L29.8 290 L29.2 287 Z" />
      </g>
    </g>

    <!-- 废墟与王者之剑 -->
    <g v-if="motif === 'sword'">
      <g transform="translate(21, 284) scale(0.55)">
        <!-- 红色透视斑驳底盘 -->
        <g id="ground">
          <ellipse cx="0" cy="2.5" rx="58" ry="17" fill="#A82319" />
          <ellipse cx="0" cy="0" rx="56" ry="16" fill="#D63F32" />
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

        <!-- 远景废墟 -->
        <g id="ruins" stroke="#33302C" stroke-width="0.7" stroke-linejoin="round" fill="#E6E3DC">
          <path d="M-46 1 L-45 -7 L-42 -8 L-41 1 Z" fill="#9C968E" />
          <path d="M-42 -8 L-41 -12 L-38 -11 L-39 0 Z" fill="#C2BEB6" />
          <path d="M-35 0 L-35 -16 L-32 -16 L-32 0 Z" fill="#7A756D" />
          <path d="M-26 0 L-26 -16 L-23 -16 L-23 0 Z" fill="#AAA59C" />
          <path d="M-35 -16 C-35 -24 -23 -24 -23 -16 L-26 -16 C-26 -21 -32 -21 -32 -16 Z" fill="#BDB8AF" />
          <path d="M-31 -16 C-31 -20 -27 -20 -27 -16" fill="none" stroke="#2B2825" stroke-width="0.6" />
          <path d="M41 1 L40 -12 L44 -13 L46 1 Z" fill="#8C877F" />
          <path d="M42 -13 L43 -16 L44 -13 Z" fill="#BDB8AE" />
          <path d="M18 0 L18 -19 L21 -20 L21 0 Z" fill="#6E6961" />
          <path d="M29 0 L29 -18 L32 -17 L32 0 Z" fill="#9E9990" />
          <path d="M17 -19 C17 -30 33 -30 33 -17 L29 -18 C29 -26 21 -26 21 -19 Z" fill="#C9C5BC" />
          <path d="M19 -19 L21 -19 M29 -18 L31 -18" stroke="#2D2A26" stroke-width="0.9" />
          <path d="M21 -20 C21 -24 29 -24 29 -18" fill="none" stroke="#2B2825" stroke-width="0.8" />
        </g>

        <!-- 碎石堆 -->
        <g id="rocks">
          <polygon points="-34,2 -28,-7 -18,-5 -12,-14 0,-10 14,-13 26,-6 35,2 0,3" fill="#3D3935" />
          <polygon points="-28,-7 -21,-13 -14,-9 -18,-5" fill="#D9D5CC" />
          <polygon points="-12,-14 -6,-20 2,-15 0,-10" fill="#EAE7DF" />
          <polygon points="2,-15 10,-19 16,-12 14,-13" fill="#D3CFC6" />
          <polygon points="16,-12 25,-15 28,-7 26,-6" fill="#C2BEB4" />
          <polygon points="-21,-13 -12,-14 -18,-5" fill="#66615A" />
          <polygon points="-6,-20 0,-22 2,-15" fill="#524E48" />
          <polygon points="10,-19 14,-21 16,-12" fill="#5E5953" />
          <polygon points="-4,-7 6,-6 11,0 -6,1" fill="#47433D" />
          <g stroke="#262320" stroke-width="0.5" stroke-linecap="round">
            <line x1="-10" y1="-12" x2="-6" y2="-8" />
            <line x1="4" y1="-13" x2="8" y2="-9" />
            <line x1="18" y1="-10" x2="22" y2="-6" />
          </g>
        </g>

        <!-- 王者之剑 -->
        <g id="sword" transform="rotate(-4.5, 0, -18)">
          <path d="M-4.5 -72 L-3.5 -18 L0 -15 L0 -72 Z" fill="#D8D5CC" stroke="#2B2826" stroke-width="0.4" />
          <path d="M0 -72 L0 -15 L3.5 -18 L4.5 -72 Z" fill="#63605A" stroke="#2B2826" stroke-width="0.4" />
          <line x1="0" y1="-68" x2="0" y2="-22" stroke="#201D1A" stroke-width="0.8" />
          <line x1="-0.5" y1="-68" x2="-0.5" y2="-22" stroke="#FFFFFF" stroke-width="0.25" opacity="0.6" />
          <path d="M-3.8 -42 L-3.0 -40 L-3.7 -38" fill="#2B2826" />
          <path d="M4.0 -55 L3.4 -53 L3.9 -51" fill="#2B2826" />

          <path d="M-14 -72 C-9 -73 -4 -71.5 0 -71.5 C4 -71.5 9 -73 14 -72 C15 -70 13 -68.5 10 -69 C4 -70 2 -69 0 -69 C-2 -69 -4 -70 -10 -69 C-13 -68.5 -15 -70 -14 -72 Z"
                fill="#3D3935" stroke="#1D1A18" stroke-width="0.5" />
          <polygon points="0,-73.5 2.5,-70.5 0,-67.5 -2.5,-70.5" fill="#C2BEB4" stroke="#2B2826" stroke-width="0.3" />

          <rect x="-1.5" y="-86" width="3" height="14" fill="#2A2724" rx="0.5" />
          <g stroke="#9E998E" stroke-width="0.35">
            <line x1="-1.5" y1="-83" x2="1.5" y2="-84" />
            <line x1="-1.5" y1="-79" x2="1.5" y2="-80" />
            <line x1="-1.5" y1="-75" x2="1.5" y2="-76" />
          </g>

          <polygon points="0,-92 3.2,-88 0,-85.5 -3.2,-88" fill="#423E3A" stroke="#1D1A18" stroke-width="0.5" />
          <polygon points="0,-91 2,-88 0,-86.5 -2,-88" fill="#C5C0B6" />

          <!-- 红飘带 -->
          <g id="ribbons">
            <path d="M1 -70
                     C8 -72 14 -76 22 -74
                     C29 -72 34 -81 44 -77
                     C38 -73 35 -73 28 -70
                     C21 -67 14 -69 2 -68 Z"
                  fill="#D6382A" stroke="#9E2217" stroke-width="0.3" />
            <path d="M42 -77 C46 -79 50 -78 54 -81 C48 -77 45 -75 41 -75 Z" fill="#B5281C" />
            <path d="M2 -68
                     C6 -66 11 -68 15 -62
                     C19 -56 26 -61 34 -58
                     C29 -56 24 -54 18 -58
                     C14 -61 8 -62 1 -67 Z"
                  fill="#BF2D20" stroke="#7A150D" stroke-width="0.3" />
            <path d="M32 -58 C37 -59 42 -56 46 -59 C40 -56 36 -55 31 -56 Z" fill="#911C13" />
            <ellipse cx="2" cy="-69.5" rx="1.5" ry="2" fill="#75150C" />
          </g>
        </g>

        <!-- 飞鸟 -->
        <g id="birds" fill="none" stroke="#33302C" stroke-width="0.55" stroke-linecap="round">
          <path d="M-26 -54 Q-24 -56 -22 -54 Q-20 -56 -18 -54" />
          <path d="M-20 -46 Q-18.5 -47.5 -17 -46 Q-15.5 -47.5 -14 -46" />
          <path d="M36 -60 Q38 -61.5 40 -60 Q42 -61.5 44 -60" stroke-width="0.45" />
          <path d="M46 -66 Q47 -67 48 -66 Q49 -67 50 -66" stroke-width="0.35" />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  motif: { type: String, default: null },
});
</script>

<style scoped>
.spine-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  color: var(--ink);
}
</style>