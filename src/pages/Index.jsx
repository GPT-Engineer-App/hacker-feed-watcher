import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseString } from 'xml2js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetchRSS = async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  return new Promise((resolve, reject) => {
    parseString(text, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const HackerNewsItem = ({ item, type }) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {item.title}
        </a>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">
        {type === 'post' ? `By ${item.author} | ${item.pubDate}` : `Comment by ${item.author} | ${item.pubDate}`}
      </p>
      {type === 'comment' && (
        <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: item.description }} />
      )}
    </CardContent>
  </Card>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['hnPosts'],
    queryFn: () => fetchRSS('https://hnrss.org/newest'),
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: commentsData, isLoading: commentsLoading, error: commentsError } = useQuery({
    queryKey: ['hnComments'],
    queryFn: () => fetchRSS('https://hnrss.org/newcomments'),
    refetchInterval: 60000, // Refetch every minute
  });

  const posts = postsData?.rss?.channel[0]?.item || [];
  const comments = commentsData?.rss?.channel[0]?.item || [];

  if (postsLoading || commentsLoading) return <div className="text-center mt-8">Loading...</div>;
  if (postsError || commentsError) return <div className="text-center mt-8 text-red-600">Error fetching data</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Hacker News Live Feed</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Latest Posts</TabsTrigger>
          <TabsTrigger value="comments">Latest Comments</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {posts.map((post, index) => (
            <HackerNewsItem key={index} item={post} type="post" />
          ))}
        </TabsContent>
        <TabsContent value="comments">
          {comments.map((comment, index) => (
            <HackerNewsItem key={index} item={comment} type="comment" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
