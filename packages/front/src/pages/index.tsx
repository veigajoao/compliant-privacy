/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable jsdoc/require-returns */

function BackgroundIllustration() {
  return (
    <div className="absolute inset-0 max-w-full max-h-full overflow-hidden">
      <img src="/hero.webp" className="w-full" />
    </div>
  );
}

export function Index() {
  return (
    <div className="relative">
      <BackgroundIllustration />

      {(
        <div className="fixed inset-0 flex items-center justify-center">
          <img src="/logo-opact.svg" className="mb-[90px]" />
        </div>
      )}
    </div>
  );
}

export default Index;
