'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Post } from '@/lib/utils';
import { FnType, getData } from './actions';

interface State {
  data: Post[];
  isLoading: boolean;
  message: string;
}

const initialState: State = {
  data: [],
  isLoading: false,
  message: '',
};

export default function Home() {
  const [state, setState] = useState<State>(initialState);

  async function onClick(type: FnType) {
    try {
      setState({ ...initialState, isLoading: true });

      const releases = await getData(type);

      if (releases.length > 0) {
        setState({
          data: releases,
          isLoading: false,
          message: '',
        });
      } else {
        setState({
          data: [],
          isLoading: false,
          message: 'No results',
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong';

      setState({
        data: [],
        isLoading: false,
        message,
      });
    }
  }

  return (
    <main className="relative flex flex-col items-center justify-between p-6 gap-6">
      <div className="absolute right-2 top-2">
        <ThemeToggle />
      </div>
      <h1 className="font-bold text-4xl">Scrape City</h1>
      <div className="flex items-center gap-4">
        <Button disabled={state.isLoading} onClick={() => onClick('nar')}>
          NAR
        </Button>
        <Button disabled={state.isLoading} onClick={() => onClick('gm')}>
          GM
        </Button>
        <Button disabled={state.isLoading} onClick={() => onClick('grm')}>
          GRM
        </Button>
        <Button disabled={state.isLoading} onClick={() => onClick('spy')}>
          SPY
        </Button>
      </div>
      {state.isLoading && <Spinner />}
      {state.data.length > 0 && (
        <ul className="list-disc text-sm ml-4">
          {state.data.map(({ id, link, title }) => (
            <li key={id}>
              <a
                className="underline text-blue-600 dark:text-blue-400"
                href={link}
                rel="noreferrer noopener"
                target="_blank"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="text-sm">{state.message}</div>
    </main>
  );
}
