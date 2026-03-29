---
title: "leetcode"
date: "2026-02-28"
excerpt: "LeetCode"
tags: ["Java", "AI"]
category: "Algorithm"
---

## LeetCode

### 两数之和

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int target = sc.nextInt();
        sc.nextLine();
        String[] s = sc.nextLine().split(" ");
        int[] nums = new int[s.length];
        for(int i = 0;i < s.length;i ++){
            nums[i] = Integer.parseInt(s[i]);
        }
        int[] ans =  twoSum(nums, target);
        for (int i = 0;i < ans.length;i ++) {
            System.out.print(ans[i]);
            if(i != ans.length - 1){
                System.out.print(" ");
            }
        }
    }

    private static int[] twoSum(int[] nums, int target){
        int n = nums.length;
        Map<Integer, Integer> map = new HashMap<>();
        for(int i = 0;i < n;i ++){
            if(map.containsKey(target - nums[i])){
                return new int[]{map.get(target - nums[i]), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
```

---

### 字母异位词分组

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] strs = sc.nextLine().split(" ");
        List<List<String>> ans = groupAnagrams(strs);

        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for(int i = 0;i < ans.size();i ++){
            sb.append("[");
            sb.append(String.join(",", ans.get(i)));
            sb.append(("]"));
            if(i != ans.size() - 1){
                sb.append(",");
            }
        }
        sb.append("]");
        System.out.println(sb.toString());
    }

    public static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for(String s : strs){
            char[] c = s.toCharArray();
            Arrays.sort(c);
            String key = new String(c);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }

}
```

---

###  最长连续序列

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] s = sc.nextLine().split(",");
        int[] nums = new int[s.length];
        for(int i = 0;i < s.length;i ++){
            nums[i] = Integer.parseInt(s[i]);
        }
        int ans = longestConsecutive(nums);
        System.out.println(ans);
    }

    public static int longestConsecutive(int[] nums) {
        int ans = 0;
        Set<Integer> set = new HashSet<>();
        for(int num : nums){
            set.add(num);
        }

        for(int num : set){
            if(!set.contains(num - 1)){
                int cur = num;
                int count = 1;
                while(set.contains(cur + 1)){
                    cur ++;
                    count ++;
                }
                ans = Math.max(ans, count);
            }
        }
        return ans;
    }
}
```

---

### 旋转图像

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        int[][] matrix = new int[m][n];
        for(int i = 0;i < m;i ++){
            for(int j = 0;j < n;j ++){
                matrix[i][j] = sc.nextInt();
            }
        }
        rotate(matrix);
        System.out.print("[");
        for(int i = 0;i < m;i ++){
            System.out.print("[");
            for(int j = 0;j < n;j ++){
                System.out.print(matrix[i][j]);
                if(j != n - 1){
                    System.out.print(",");
                }
            }
            System.out.print("]");
            if(i != m - 1){
                System.out.print(",");
            }
        }
        System.out.print("]");

    }

    public static void rotate(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        for(int i = 0;i < m;i ++){
            for(int j = i + 1;j < n;j ++){
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
        for(int i = 0;i < m;i ++){
            int left = 0, right = n - 1;
            while(left < right){
                int temp = matrix[i][left];
                matrix[i][left] = matrix[i][right];
                matrix[i][right] = temp;
                left ++;
                right --;
            }
        }
    }
}
```

---

### 分割回文串

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        List<List<String>> ans = partition(s);
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for(int i = 0;i < ans.size();i ++) {
            sb.append("[");
            sb.append(String.join(",", ans.get(i)));
            sb.append(']');
            if (i != ans.size() - 1) {
                sb.append(",");
            }
        }
        sb.append(']');
        System.out.println(sb.toString());
    }


    public static List<List<String>> partition(String s) {
        List<List<String>> ans = new ArrayList<>();
        List<String> path = new ArrayList<>();
        backtrack(s, 0, ans, path);
        return ans;
    }

    private static void backtrack(String s, int flag, List<List<String>> ans, List<String> path){
        if(flag == s.length()){
            ans.add(new ArrayList<>(path));
            return;
        }
        for(int i = flag;i < s.length();i ++){
            if(isPalindrome(s, flag, i)){
                path.add(s.substring(flag, i + 1));
                backtrack(s, i + 1, ans, path);
                path.remove(path.size() - 1);
            }
        }
    }

    private static boolean isPalindrome(String s, int left, int right){
        while(left < right){
            if(s.charAt(left) != s.charAt(right)){
                return false;
            }
            left ++;
            right --;
        }
        return true;
    }
}
```

---

### 最小覆盖子串

```java
package algothrim.practice;
import java.util.*;

/**
 * @author Haibaraiii
 * @date 2026/2/27 20:59
 * @description TODO
 */
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String t = sc.nextLine();

        String ans = minWindow(s, t);
        System.out.print(ans);
    }


    public static String minWindow(String s, String t) {
        int m = s.length(), n = t.length();
        int[] cnt = new int[128];
        for(char c : t.toCharArray()){
            cnt[c] --;
        }

        int minLen = Integer.MAX_VALUE, minLeft = 0;
        int have = 0;

        for(int left = 0, right = 0; right < m; right ++){
            char c = s.charAt(right);
            if(cnt[c] < 0){
                have ++;
            }
            cnt[c] ++;
            while(have == n){
                if(right - left + 1 < minLen){
                    minLen = right - left + 1;
                    minLeft = left;
                }
                char cc = s.charAt(left);
                cnt[cc] --;
                if(cnt[cc] < 0) have --;
                left ++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(minLeft, minLen + minLeft);
    }
}
```

---

### 













