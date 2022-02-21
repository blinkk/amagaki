import { Pod } from "../../../dist/src";

const getFields = (pod: Pod) => {
  return {
    $path: '/foo/',
    title: pod.readYaml('/content/partials/base.yaml').title,
  }
}

export default getFields;
