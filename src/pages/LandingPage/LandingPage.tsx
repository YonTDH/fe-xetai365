import { useEffect, useState } from 'react';
import { HeroSection } from './Banner-News';
import { FeaturesSection } from './Top-products';
import { CategoriesSection } from './Categories';
import { getLandingHomeData, listCatalogCategoriesTree, type CategoryNode, type LandingHomeData } from '@/api/landingApi';

export function LandingPage() {
  const [homeData, setHomeData] = useState<LandingHomeData>({
    hero: { title: '', description: '', hotline: '' },
    featuredProducts: [],
    latestNews: [],
  });
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [homeResult, categoryResult] = await Promise.allSettled([
        getLandingHomeData(),
        listCatalogCategoriesTree(),
      ]);

      if (!isMounted) return;

      if (homeResult.status === 'fulfilled') {
        setHomeData(homeResult.value);
      } else {
        setHomeData({
          hero: { title: '', description: '', hotline: '' },
          featuredProducts: [],
          latestNews: [],
        });
      }

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value);
      } else {
        setCategories([]);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <HeroSection
        latestNews={homeData.latestNews}
      />
      <FeaturesSection
        products={homeData.featuredProducts}
        hotline={homeData.hero.hotline}
      />
      <CategoriesSection
        categories={categories}
        hotline={homeData.hero.hotline}
      />
    </>
  )
}
