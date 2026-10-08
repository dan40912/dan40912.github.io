import { racketOf } from "./abilities.js?v=20261008-targets";
export const TEAM_COLORS = ["#4782a5", "#4782a5", "#c56b57", "#c56b57"];
export const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function portrait(p, index, opts = {}) {
  const { expression = "ready", faceOnly = false } = opts;
  const skin =
      { light: "#f4d2ba", warm: "#dca77f", deep: "#a66c4d" }[p.skin] ||
      "#dca77f",
    hair = /^#[0-9a-f]{6}$/i.test(p.hairColor) ? p.hairColor : "#253b38",
    identityAccent = /^#[0-9a-f]{6}$/i.test(p.visualTheme?.accent) ? p.visualTheme.accent : "#7b8260",
    jersey = TEAM_COLORS[index],
    outline = "#243b35",
    [frame, accent] = racketOf(p).colors;
  const face =
    p.face === "angular"
      ? "M53 70Q50 36 100 35Q150 36 147 70L143 112 124 138 100 148 76 138 57 112Z"
      : p.face === "oval"
        ? "M53 73Q50 32 100 33Q150 32 147 73L145 104Q139 146 100 150Q61 146 55 104Z"
        : "M50 73Q49 33 100 33Q151 33 150 73L149 105Q144 145 100 145Q56 145 51 105Z";
  const back =
    p.hair === "pony"
      ? `<path d="M143 60Q193 61 164 144Q170 111 139 106Z" fill="${hair}" stroke="${outline}" stroke-width="2"/>`
      : p.hair === "bob"
        ? `<path d="M48 55Q100 7 152 55L158 124Q149 139 127 133L74 133Q47 144 42 124Z" fill="${hair}" stroke="${outline}" stroke-width="2"/>`
        : p.hair === "bun"
          ? `<circle cx="113" cy="28" r="23" fill="${hair}" stroke="${outline}" stroke-width="2.3"/><path d="M96 17q17-12 32 5M95 30q18-13 34 3" fill="none" stroke="${identityAccent}" stroke-width="2"/>`
          : p.hair === "braid"
            ? `<g fill="${hair}" stroke="${outline}" stroke-width="2"><path d="M137 65q35 20 18 47l-5 48-18-7 6-49Z"/><path d="M147 91q-18 9 10 21q-22 9-4 20q-20 6-4 22" fill="none"/><path d="m133 145 20 5-3 9-18-5Z" fill="${identityAccent}"/></g>`
        : "";
  const fringe =
    {
      buzz: "M52 69L53 48Q57 30 78 29L123 29Q144 30 148 48L148 69L138 57L62 57Z",
      crop: "M51 77Q43 40 63 25L65 36 82 17 85 31 108 13 108 28 127 23 139 37Q157 53 149 77L134 62 122 65 109 52 88 66 76 60 62 79Z",
      sweep:
        "M50 81Q38 41 74 24Q117 9 145 39Q158 59 149 82L133 59Q107 48 69 69L61 86Z",
      bob: "M51 85Q43 40 78 27Q113 14 138 38Q155 58 149 87L133 63 124 72 119 59 89 62 68 57 60 87Z",
      pony: "M50 81Q39 43 69 28Q103 13 132 29Q161 46 149 85L136 57Q120 70 91 57L68 69 60 88Z",
      bun: "M50 78Q41 36 76 27Q111 17 137 35Q157 48 149 81L136 58Q102 72 67 57L60 81Z",
      braid: "M51 81Q39 44 68 28Q106 11 138 38Q157 54 149 82L133 59Q111 79 78 62L62 85Z",
      curls: "M49 83Q32 69 45 56Q32 40 49 34Q46 15 66 22Q72 6 89 17Q105 3 118 18Q138 11 144 31Q164 33 155 50Q170 65 149 83L137 66Q125 80 113 63Q101 77 87 62Q69 78 61 65Z",
      mohawk: "M52 77L54 48 74 40 76 23 93 30 101 8 111 27 130 17 130 40 146 49 148 77 135 65 124 64 106 49 91 60 64 68Z",
    }[p.hair] || "";
  const happy = expression === "happy",
    sad = expression === "sad",
    focused = expression === "focus";
  const eyeShape = p.personality === "bold"
    ? '<path d="M67 94l24-3v12q-12 8-22-1Z"/><path d="m109 91 24 3-2 9q-11 8-22 0Z"/>'
    : p.personality === "patient"
      ? '<path d="M67 96q12-11 24-1v9q-12 7-22-1Z"/><path d="M109 95q12-10 24 1l-2 7q-11 8-22 1Z"/>'
      : '<path d="M67 93q11-10 24 0v12q-11 8-22-1Z"/><path d="M109 93q12-10 24 0l-2 11q-11 9-22 1Z"/>';
  const eyes = happy
    ? '<path d="M69 97q10-13 20 0M111 97q10-13 20 0" fill="none" stroke="#243b35" stroke-width="3.5" stroke-linecap="round"/>'
    : `<g fill="#fffefa" stroke="${outline}" stroke-width="2">${eyeShape}</g><g fill="${identityAccent}"><ellipse cx="81" cy="99" rx="6" ry="7"/><ellipse cx="119" cy="99" rx="6" ry="7"/></g><g fill="${outline}"><ellipse cx="81" cy="99" rx="3" ry="6"/><ellipse cx="119" cy="99" rx="3" ry="6"/></g><g fill="white"><circle cx="79" cy="96" r="2.5"/><circle cx="117" cy="96" r="2.5"/></g>`;
  const brows = focused || (!sad && p.personality === "bold")
    ? "M68 80l21 6M111 86l21-6"
    : sad
      ? "M68 85l20-5M112 80l20 5"
      : "M68 83q10-5 20-1M112 82q10-4 20 1";
  const mouth = happy
    ? '<path d="M87 120q13 18 26 0Z" fill="#fffefa" stroke="#243b35" stroke-width="2"/>'
    : sad
      ? '<path d="M90 126q10-8 20 0" fill="none" stroke="#243b35" stroke-width="2.2" stroke-linecap="round"/>'
      : '<path d="M91 121q9 6 18 0" fill="none" stroke="#243b35" stroke-width="2.2" stroke-linecap="round"/>';
  const accessory =
    p.accessory === "headscarf"
      ? `<g fill="${identityAccent}" stroke="${outline}" stroke-width="1.5"><path d="M52 64q48-12 96 0l-2 16q-46-11-92 0Z"/><path d="M146 68q21-14 18 8l-16 5q23 7 13 26l-16-26Z"/></g><path d="M62 69q36-7 70-2" fill="none" stroke="#fffefa" stroke-width="2" opacity=".7"/>`
      : p.accessory === "visor"
        ? `<path d="M50 67q50-23 100 0l-1 12q-50-14-98 0Z" fill="${identityAccent}" stroke="${outline}" stroke-width="2"/><path d="M48 74q51-13 105 3l12 11q-71-10-119 0Z" fill="#eef2dd" stroke="${outline}" stroke-width="2"/>`
      : p.accessory === "band"
      ? `<path d="M53 71q47-15 94 0l-1 10q-46-13-92 0Z" fill="#eef2dd" stroke="${outline}" stroke-width="1.5"/><path d="m93 66 13 10" stroke="${identityAccent}" stroke-width="3"/>`
      : p.accessory === "glasses"
        ? '<g fill="none" stroke="#304f44" stroke-width="2.5"><rect x="63" y="89" width="32" height="23" rx="8"/><rect x="105" y="89" width="32" height="23" rx="8"/><path d="M95 97h10M54 95h9M137 95h9"/></g>'
        : "";
  const strands = {
    buzz: "M64 44h9m7 0h9m7 0h9m7 0h9m7 0h8",
    curls: "M52 43q7-10 15 0M74 28q7-9 14 1M102 27q9-11 16 2M130 43q8-9 16 3",
    mohawk: "M85 43l7-9m10 7 4-15m8 15 8-10",
    crop: "m75 47 10-9m8 6 11-11m9 13 9-8",
  }[p.hair] || "M65 47q21-18 53-12M76 54q22-17 52-10";
  const head = `${back}
    <g fill="${skin}" stroke="${outline}" stroke-width="2"><ellipse cx="51" cy="94" rx="9" ry="13"/><ellipse cx="149" cy="94" rx="9" ry="13"/></g>
    <path d="${face}" fill="${skin}" stroke="${outline}" stroke-width="2.5"/>
    <path d="M143 90q0 38-28 49q20-5 28-27Z" fill="#99624b22"/>
    <path d="M50 91q9-6 10 7M140 98q1-13 10-7" fill="none" stroke="#99624b" stroke-width="1.5"/>
    <ellipse cx="67" cy="114" rx="9" ry="4" fill="#d4777540"/><ellipse cx="133" cy="114" rx="9" ry="4" fill="#d4777540"/>
    <path d="${fringe}" fill="${hair}" stroke="${outline}" stroke-width="2.3"/>
    <path d="${strands}" fill="none" stroke="#fffefa40" stroke-width="2" stroke-linecap="round"/>
    <path d="${brows}" fill="none" stroke="${outline}" stroke-width="3" stroke-linecap="round"/>${eyes}
    <path d="m100 105-3 8h5" fill="none" stroke="#99624b" stroke-width="1.5" stroke-linecap="round"/>${mouth}${accessory}
    ${focused ? '<path d="M142 80q-5 8 0 11q5-3 0-11Z" fill="#b9dce6" stroke="#507e8b" stroke-width="1"/>' : ""}`;
  const jerseyPattern = {
    attack: "M58 197 125 161 139 170 55 214Z",
    net: "m62 182 38 15 38-15-2 13-36 15-40-16Z",
    defense: "M81 178h38v22l-19 15-19-15Z",
    drive: "m57 191 85-12-1 8-85 12Zm0 15 87-12-1 8-87 12Z",
  }[p.style] || "M57 194h86v9H57Z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${faceOnly ? "25 3 155 162" : "0 0 200 240"}" aria-hidden="true"><g stroke-linejoin="round">
    ${!faceOnly ? `<ellipse cx="100" cy="225" rx="57" ry="7" fill="#183d310b"/>
      <path d="M57 173Q43 183 40 215L65 219 73 182M143 173q14 10 17 42l-25 4-8-37" fill="${skin}" stroke="${outline}" stroke-width="2.3"/>
      <path d="M61 161 82 152h36l21 9 8 59H53Z" fill="${jersey}" stroke="${outline}" stroke-width="2.5"/>
      <path d="${jerseyPattern}" fill="${identityAccent}" opacity=".8"/>
      <path d="m61 167 17 8M139 167l-17 8" stroke="#fffefa" stroke-width="7"/>
      <path d="M86 144v15q14 17 28 0v-15" fill="${skin}" stroke="${outline}" stroke-width="2"/>
      <path d="M82 156q18 28 36 0" fill="none" stroke="#fffefa" stroke-width="4"/>
      <path d="M43 202l22 4M135 206l22-4" stroke="${identityAccent}" stroke-width="7"/>
      <path d="m87 194 19-15M95 180h12v12" fill="none" stroke="#eef2dd" stroke-width="3"/>
      <path d="M150 183l12-35" stroke="${outline}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M150 183l12-35" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="166" cy="133" rx="13" ry="19" transform="rotate(20 166 133)" fill="#fffefa55" stroke="${outline}" stroke-width="4.6"/>
      <ellipse cx="166" cy="133" rx="13" ry="19" transform="rotate(20 166 133)" fill="none" stroke="${frame}" stroke-width="2.8"/>
      <path d="M159 119l12 27M155 128l21 7" stroke="#869d8c" stroke-width="1"/>` : ""}${head}</g></svg>`;
}
export function describe(p) {
  const descriptions = {
    attack: "偏好後場下壓，與隊友創造前後配合。",
    net: "善用網前小球，為隊友創造進攻機會。",
    defense: "優先穩住防守，等待轉守為攻的時機。",
    drive: "用平抽與快壓，搶下中場的主動權。",
    allround: "依球的位置，在攻守之間靈活切換。",
  };
  return descriptions[p.style];
}
