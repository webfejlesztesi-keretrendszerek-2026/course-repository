export interface Recipe {
  image: string;
  badges: string[];
  own?: boolean;
  title: string;
  meta: string;
  desc: string;
}

export default Recipe;
