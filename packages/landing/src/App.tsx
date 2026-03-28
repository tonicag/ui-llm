import React from 'react';
import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { Problem } from './sections/Problem';
import { Solution } from './sections/Solution';
import { Features } from './sections/Features';
import { UseCases } from './sections/UseCases';
import { Quickstart } from './sections/Quickstart';
import { Architecture } from './sections/Architecture';
import { Comparison } from './sections/Comparison';
import { Footer } from './sections/Footer';

export function App() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: '4rem' }}>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <UseCases />
        <Quickstart />
        <Architecture />
        <Comparison />
        <Footer />
      </div>
    </>
  );
}
