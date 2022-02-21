import {TemplateContext} from '@amagaki/amagaki';
import {h} from 'preact';

function Page({doc}: TemplateContext) {
  return (
    <div className="page">
      <div className="page__headline">{doc.fields.headline}</div>
    </div>
  );
}

export default Page;
