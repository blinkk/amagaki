import { ExecutionContext } from 'ava';
import { PartialHydrator } from './hydrator';
import { JSDOM } from 'jsdom';
import Hero from '../example/src/partials/Hero/Hero';
import test from 'ava';

test('hydrate partials', (t: ExecutionContext) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en" itemscope itemtype="https://schema.org/WebPage">
      <meta charset="utf-8">
      <body>
        <div class="main">
          <main>
            <page-module partial="Hero" position="1">
              <page-module-container>
                <div class="hero">
                  <div class="hero__headline">Hello World</div>
                </div>
              </page-module-container>
              <page-module-context>
                <script type="application/json">
                  {
                    "headline": "Hydrated"
                  }
                </script>
              </page-module-context>
            </page-module>
          </main>
        </div>
      </body>
    </html>
    `;
  const dom = new JSDOM(html);
  // @ts-ignore
  global.window = dom.window;
  global.document = window.document;
  const hydrator = PartialHydrator.register({
    components: [Hero],
  });
  hydrator.hydratePartials();
  t.deepEqual(document.querySelector('.hero__headline')?.textContent, 'Hydrated');
});
