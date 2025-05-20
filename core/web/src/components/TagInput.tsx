import React, { FC, useState, KeyboardEvent } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

interface TagInputProps {
  label: string
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
  width?: string
}

const TagInput: FC<TagInputProps> = ({
  label,
  tags,
  setTags,
  placeholder = '',
  width = '100%'
}) => {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setInputValue('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="flex flex-col w-full" style={{ maxWidth: width }}>
      <label className="self-start text-md text-gray-700 font-bold mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addTag}
          className="ml-2 w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600"
        >
          ＋
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center bg-blue-100 text-blue-700 rounded-full py-1 px-3"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default TagInput
