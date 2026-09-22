/*
  One value per build, used to bust the stylesheet's cache.

  `/styles.css` has no content hash in its name — it is a plain file in
  `public/` — so a returning visitor keeps whatever copy their browser cached
  until it expires. That has already cost us several rounds of "the fix isn't
  live" when it was live, and it costs real visitors a broken-looking page
  after every design change. The module is evaluated once when the site is
  built, so every page in one deploy carries the same id and a new deploy
  carries a new one.
*/
export const BUILD_ID = Date.now().toString(36);
