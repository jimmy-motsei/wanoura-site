export function computeScore({ skillsMatch, yearsMatch, locationFit, education }:{
  skillsMatch:number; yearsMatch:number; locationFit:number; education:number;
}){
  // Weighted simple rubric (0–100)
  const score = skillsMatch*0.5 + yearsMatch*0.25 + locationFit*0.15 + education*0.10
  return Math.round(score)
}
