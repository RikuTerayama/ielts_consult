export type A8Ad = {
  id: string;
  width: 300 | 336 | 728;
  height: 90 | 250 | 280;
  html: string;
};

/**
 * A8.net が発行した広告コード。リンク、バナー、計測用 1x1 GIF を含め、
 * 発行コードをそのまま保持する。
 */
export const A8_ADS: readonly A8Ad[] = [
  {
    id: "a8-01",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4B3SMZ+5RSAWI+5B0Y+5ZU29" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www29.a8.net/svt/bgt?aid=260517563349&wid=001&eno=01&mid=s00000024757001007000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4B3SMZ+5RSAWI+5B0Y+5ZU29" alt="">`,
  },
  {
    id: "a8-02",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4B3SMZ+5RSAWI+5B0Y+63WO1" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www28.a8.net/svt/bgt?aid=260517563349&wid=001&eno=01&mid=s00000024757001026000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4B3SMZ+5RSAWI+5B0Y+63WO1" alt="">`,
  },
  {
    id: "a8-03",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AZHWA+28DJG2+5PZU+5YZ75" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www21.a8.net/svt/bgt?aid=260317018135&wid=001&eno=01&mid=s00000026697001003000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www13.a8.net/0.gif?a8mat=4AZHWA+28DJG2+5PZU+5YZ75" alt="">`,
  },
  {
    id: "a8-04",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AZMKE+EF60AA+5OEW+5ZEMP" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www22.a8.net/svt/bgt?aid=260323070872&wid=001&eno=01&mid=s00000026492001005000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AZMKE+EF60AA+5OEW+5ZEMP" alt="">`,
  },
  {
    id: "a8-05",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AZMKE+EF60AA+5OEW+601S1" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www24.a8.net/svt/bgt?aid=260323070872&wid=001&eno=01&mid=s00000026492001008000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4AZMKE+EF60AA+5OEW+601S1" alt="">`,
  },
  {
    id: "a8-06",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AZHWA+2DQFW2+35VG+67C4H" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www27.a8.net/svt/bgt?aid=260317018144&wid=001&eno=01&mid=s00000014758001042000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www18.a8.net/0.gif?a8mat=4AZHWA+2DQFW2+35VG+67C4H" alt="">`,
  },
  {
    id: "a8-07",
    width: 300,
    height: 250,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AX6C9+E22GZ6+5Q2M+5Z6WX" rel="nofollow">
<img border="0" width="300" height="250" alt="" src="https://www28.a8.net/svt/bgt?aid=260208729850&wid=001&eno=01&mid=s00000026707001004000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AX6C9+E22GZ6+5Q2M+5Z6WX" alt="">`,
  },
  {
    id: "a8-08",
    width: 336,
    height: 280,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AX6C9+AAX2NM+428Q+67C4H" rel="nofollow">
<img border="0" width="336" height="280" alt="" src="https://www22.a8.net/svt/bgt?aid=260208729623&wid=001&eno=01&mid=s00000018953001042000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4AX6C9+AAX2NM+428Q+67C4H" alt="">`,
  },
  {
    id: "a8-09",
    width: 728,
    height: 90,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AX6C9+AF33W2+2QEI+5YRHD" rel="nofollow">
<img border="0" width="728" height="90" alt="" src="https://www25.a8.net/svt/bgt?aid=260208729630&wid=001&eno=01&mid=s00000012753001002000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4AX6C9+AF33W2+2QEI+5YRHD" alt="">`,
  },
  {
    id: "a8-10",
    width: 336,
    height: 280,
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AX6C9+AF33W2+2QEI+5Z6WX" rel="nofollow">
<img border="0" width="336" height="280" alt="" src="https://www24.a8.net/svt/bgt?aid=260208729630&wid=001&eno=01&mid=s00000012753001004000&mc=1"></a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AX6C9+AF33W2+2QEI+5Z6WX" alt="">`,
  },
] as const;
