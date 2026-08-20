const packageRoot = new URL('../node_modules/@vemetric/web/', import.meta.url);
const source = await Bun.file(new URL('dist/main.js', packageRoot)).text();
const license = await Bun.file(new URL('LICENSE', packageRoot)).text();

if (!source.includes('https://hub.vemetric.com')) {
  throw new Error('The pinned @vemetric/web bundle changed unexpectedly; review it before publishing.');
}

const banner =
  '/*! Insight.info browser SDK — derived from @vemetric/web 0.6.1 (MIT). See insight.min.js.LICENSE.txt. */\n';
const bundle = banner + source.replaceAll('https://hub.vemetric.com', 'https://insight.info');
const targets = ['apps/app/public', 'apps/site/public'];

for (const target of targets) {
  await Bun.write(`${target}/insight.min.js`, bundle);
  await Bun.write(`${target}/insight.min.js.LICENSE.txt`, license);
}

console.log(`Published the pinned first-party web SDK to ${targets.join(' and ')}.`);
