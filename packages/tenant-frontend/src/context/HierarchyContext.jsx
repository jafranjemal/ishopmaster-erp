import React, { createContext, useContext } from 'react';

const HierarchyContext = createContext({
  currentState: null,
  selections: {},
  productSelections: [],
  loading: false,
  navigate: () => {},
  reset: () => {},
});

export const useHierarchyContext = () => useContext(HierarchyContext);

export const HierarchyProvider = HierarchyContext.Provider;
export default HierarchyContext;
