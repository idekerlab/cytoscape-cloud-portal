import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import HoverTab from './HoverTab';
import Empty from './Empty';
import TabContent from './TabContent';

// Conversion table from tab ID to human-readable labels
const TAB_LABELS = {
  'enrichment': {
    label: 'Relevant Pathways',
  },
  'interactome-ppi': {
    label: 'Protein Interactions',
  },
  'interactome-association': {
    label: 'Gene Association',
  },
  'pathwayfigures': {
    label: 'Pathway Figures',
  },
};

const backgroundcolor = 'rgb(235, 235, 235)';

const styles = (theme) => ({
  tabs: {},
  grow: {
    flexGrow: 1,
  },
});

const Results = (props) => {
  const { classes, ...others } = props;

  // For tab selection
  const [idx, setSelectedTabIndex] = useState(0);

  useEffect(() => {
    updateHistory(0);
  }, []);

  const handleChange = (event, idx) => {
    setSelectedTabIndex(idx);
    updateHistory(idx);
    props.networkActions.networkClear();
    props.networkActions.changeListIndex(0);
  };

  const updateHistory = (newValue) => {
    // Update URL
    const results = props.search.results;
    if (results === null || results === undefined) {
      return;
    }

    const jobId = results.jobId;
    const searchResults = props.search.searchResults;
    if (searchResults !== undefined && searchResults !== null) {
      const sourceName = getSourceName(sources, newValue);
      console.log('* Tab change:', jobId, sourceName);
      props.uiStateActions.setSelectedSource(sourceName);
      props.history.push(`/${jobId}/${sourceName}`);
    }
  };

  // Source list is not available.  Just return empty result
  const { sources } = props.source;
  if (sources === null || sources === undefined || sources.length === 0) {
    return <Empty />;
  }

  const searchResults = props.search.searchResults;
  const selectedSourceName = getSourceName(sources, idx);

  if (selectedSourceName == null) {
    return <Empty />;
  }

  const results = findResult(selectedSourceName, searchResults);

  // Get current tab selection
  return (
    <div className='results-container'>
      <div className='results-wrapper'>
        <Tabs value={idx} onChange={handleChange} className={classes.tabs}>
          {sources.map((source) => (
            <HoverTab
              key={source.uuid}
              label={
                TAB_LABELS[source.name] ? TAB_LABELS[source.name].label : null
              }
              backgroundcolor={backgroundcolor}
            />
          ))}
        </Tabs>

        {props.search.results.genes.size ? (
          <TabContent results={results} {...others} />
        ) : (
          <Empty
            message='No valid query genes.'
            details='Your query did not contain any valid gene names.'
          />
        )}
      </div>
    </div>
  );
};

const getSourceName = (sources, idx) => {
  if (sources[idx] == null) {
    return 'enrichment';
  }
  return sources[idx].name;
};

const findResult = (sourceName, results) => {
  if (results === null || results === undefined) {
    return null;
  }

  const resultArray = results.sources.filter((entry) => entry !== undefined);
  let idx = resultArray.length;

  while (idx--) {
    const currentResult = resultArray[idx];
    if (currentResult.sourceName === sourceName) {
      return currentResult;
    }
  }
  return null;
};

export default withStyles(styles)(Results);
