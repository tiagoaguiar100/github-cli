import { joinRepoLanguages } from './index';
import * as util from './util';

describe("Test fetchUser module", () => {
  afterEach(() => {
    jest.resetModules()
  })

  it('testing joinRepoLanguages without secondary languages', async () => {
    const response = [{
      id: '1',
      language: 'Java',
      name: 'testRepo'
    }]
    jest.spyOn(util, "get").mockResolvedValue(null);
  
    expect(await joinRepoLanguages(response, "username")).toStrictEqual(
      [{languages: ['Java'], name: "testRepo"}]
    );
  });


  it('testing joinRepoLanguages with secondary languages', async () => {
    const response = [{
      id: '1',
      language: 'Java',
      name: 'testRepo'
    }]

    jest.spyOn(util, "get").mockResolvedValue({Java: 1, CSS: 2});

    expect(await joinRepoLanguages(response, "username")).toStrictEqual(
      [{languages: ['Java', 'CSS'], name: "testRepo"}]
    );
  });
});