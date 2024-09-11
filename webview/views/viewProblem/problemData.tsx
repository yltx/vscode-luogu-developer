import { ProblemDetails } from 'luogu-api';

const problemData = JSON.parse(
  document.getElementById('lentille-context')!.innerText
) as ProblemDetails;

export default problemData;
